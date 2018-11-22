const db = require('../db');

async function createTables() {
  //adding surveys and related users for those surveys to test
  //build up our test tables
  await db.query(`
    CREATE TABLE users
    (
      username text PRIMARY KEY,
      password text NOT NULL,
      email text NOT NULL UNIQUE,
      first_name text NOT NULL,
      last_name text NOT NULL,
      photo_url text DEFAULT 'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg',
      is_admin boolean NOT NULL default false
    )
  `)
  await db.query(`      
    CREATE TABLE surveys
    (
      id SERIAL PRIMARY KEY,
      author text REFERENCES users ON DELETE cascade,
      title text NOT NULL UNIQUE,
      description text,
      anonymous boolean NOT NULL default true,
      published boolean NOT NULL default false,
      date_posted TIMESTAMP default CURRENT_TIMESTAMP
    )
  `)
  await db.query(`
    CREATE TABLE questions
    (
      id SERIAL PRIMARY KEY,
      survey_id integer REFERENCES surveys ON DELETE cascade,
      type text NOT NULL,
      title text NOT NULL
    )
  `)
  await db.query(`
    CREATE TABLE choices
    (
      id SERIAL PRIMARY KEY,
      question_id integer REFERENCES questions ON DELETE cascade,
      content text,
      type text NOT NULL,
      title text NOT NULL
    )
  `)
  await db.query(`
    CREATE TABLE votes
    (
      choice_id integer NOT NULL REFERENCES choices ON DELETE cascade,
      question_id integer NOT NULL REFERENCES questions ON DELETE cascade,
      survey_id integer NOT NULL REFERENCES surveys ON DELETE cascade,
      username text NOT NULL REFERENCES users ON DELETE cascade,
      PRIMARY KEY (choice_id, question_id, survey_id, username),
      score integer NOT NULL
    )
  `)
}

async function insertTestData() {
  let result1 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('joerocket', 'testpass', 'joe', 'smith', 'joe@gmail.com', True)
  RETURNING username, first_name, last_name, email, photo_url, is_admin
  `);
  let result2 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('spongebob', 'garry', 'SpongeBob', 'SquarePants', 'sponge@gmail.com', False)
  RETURNING username, first_name, last_name, email, photo_url, is_admin
  `);
  let result3 = await db.query(`
  INSERT INTO surveys (author, title, description)
  VALUES ('joerocket', 'best albums of 2009', 'hot fiya')
  RETURNING id, author, title, description, anonymous, date_posted
  `);
  let result4 = await db.query(`
  INSERT INTO surveys (author, title, description)
  VALUES ('spongebob','top ceos','top ceos of all time')
  RETURNING id, author, title, description, anonymous, date_posted
  `);

  const user1 = result1.rows[0];
  const user2 = result2.rows[0];
  const survey1 = result3.rows[0];
  const survey2 = result4.rows[0];

  let result5 = await db.query(`
  INSERT INTO questions (title, type, survey_id)
  VALUES ('Favorite EDM Artist','multiple', $1)
  RETURNING id, title, type, survey_id
  `, [survey1.id]);

  let result6 = await db.query(`
  INSERT INTO questions (title, type, survey_id)
  VALUES ('Favorite Bootcamp CEO','ranked', $1)
  RETURNING id, title, type, survey_id
  `, [survey2.id]);

  const question1 = result5.rows[0];
  const question2 = result6.rows[0];

  // Setup 4 choices per question as test

  // 4 choices for favorite EDM artists

  let result7 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Bassnectar-Test-Youtube-Link.html', 'Bassnectar', 'youtube')
    RETURNING id, question_id, content, title, type
    `,
    [question1.id]
  );

  let result8 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Tiesto-Youtube-Link.html', 'Tiesto', 'youtube')
    RETURNING id, question_id, content, title, type
    `,
    [question1.id]
  );

  let result9 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Beats-Antique-Youtube-Link.html', 'Beats Antique', 'youtube')
    RETURNING id, question_id, content, title, type
    `,
    [question1.id]
  );

  let result10 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Slugabed-Youtube-Link.html', 'Slugabed', 'youtube')
    RETURNING id, question_id, content, title, type
    `,
    [question1.id]
  );

  const choice1 = result7.rows[0];
  const choice2 = result8.rows[0];
  const choice3 = result9.rows[0];
  const choice4 = result10.rows[0];

  // 4 choices for top bootcamp school ceo

  let result11 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Elie-CEO.html', 'Elie Schoppik', 'text')
    RETURNING id, question_id, content, title, type
    `,
    [question2.id]
  );

  let result12 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Matt-CEO.html', 'Matthew Lane', 'text')
    RETURNING id, question_id, content, title, type
    `,
    [question2.id]
  );

  let result13 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Steve-Jerbs-CEO.html', 'Steve Jerbs', 'text')
    RETURNING id, question_id, content, title, type
    `,
    [question2.id]
  );

  let result14 = await db.query(`
    INSERT INTO choices (question_id, content, title, type)
    VALUES ($1, 'Chill-Gates-CEO.html', 'Chill Gates', 'text')
    RETURNING id, question_id, content, title, type
    `,
    [question2.id]
  );

  const choice5 = result11.rows[0];
  const choice6 = result12.rows[0];
  const choice7 = result13.rows[0];
  const choice8 = result14.rows[0];

  // Both users vote on the same choice for question1 which is multiple
  // choice so question 3 should be the winner for that question in tests
  let result15 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 1)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey1.id, question1.id, choice3.id, user1.username]
  );

  let result16 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 1)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey1.id, question1.id, choice3.id, user2.username]
  );

  const vote1 = result15.rows[0];
  const vote2 = result16.rows[0];

  // user1's 4 votes for one question (ranked question with 4 choices)
  let result17 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 4)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice5.id, user1.username]
  );

  let result18 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 3)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice6.id, user1.username]
  );

  let result19 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 2)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice7.id, user1.username]
  );

  let result20 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 1)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice8.id, user1.username]
  );

  const vote3 = result17.rows[0];
  const vote4 = result18.rows[0];
  const vote5 = result19.rows[0];
  const vote6 = result20.rows[0];

  // user2's 4 votes for one question (ranked question with 4 choices)
  let result21 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 3)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice5.id, user2.username]
  );

  let result22 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 2)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice6.id, user2.username]
  );

  let result23 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 4)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice7.id, user2.username]
  );

  let result24 = await db.query(`
    INSERT INTO votes (survey_id, question_id, choice_id, username, score)
    VALUES ($1, $2, $3, $4, 1)
    RETURNING survey_id, question_id, choice_id, username, score
    `,
    [survey2.id, question2.id, choice8.id, user2.username]
  );

  const vote7 = result21.rows[0];
  const vote8 = result22.rows[0];
  const vote9 = result23.rows[0];
  const vote10 = result24.rows[0];

  // Results for ranked question (2) should be as follows:
  // Elie - 7 points
  // Steve Jerbs - 6 points
  // Matt Lane - 5 points
  // Chill Gates - 2 points

  return {
    survey1,
    survey2,
    question1,
    question2,
    user1,
    user2,
    choice1,
    choice2,
    choice3,
    choice4,
    choice5,
    choice6,
    choice7,
    choice8,
    vote1,
    vote2,
    vote3,
    vote4,
    vote5,
    vote6,
    vote7,
    vote8,
    vote9,
    vote10
  };
}

async function dropTables() {
  await db.query(`DROP TABLE votes`);
  await db.query(`DROP TABLE choices`);
  await db.query(`DROP TABLE questions`);
  await db.query(`DROP TABLE surveys`);
  await db.query(`DROP TABLE users`);
}

module.exports = {
  createTables,
  insertTestData,
  dropTables
};
