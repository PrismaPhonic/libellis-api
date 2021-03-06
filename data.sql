CREATE TABLE users
(
  username text PRIMARY KEY,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  photo_url text
    DEFAULT 'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg',
  is_admin boolean NOT NULL default false
);

CREATE TABLE categories
(
  title text NOT NULL PRIMARY KEY
);

CREATE TABLE surveys
(
  id SERIAL PRIMARY KEY,
  author text NOT NULL REFERENCES users ON DELETE cascade,
  title text NOT NULL UNIQUE,
  description text,
  category text NOT NULL REFERENCES categories(title) ON DELETE cascade,
  anonymous boolean NOT NULL default true,
  published boolean NOT NULL default false,
  date_posted TIMESTAMP NOT NULL default CURRENT_TIMESTAMP
);

CREATE TABLE questions
(
  id SERIAL PRIMARY KEY,
  survey_id integer NOT NULL REFERENCES surveys ON DELETE cascade,
  question_type text NOT NULL,
  title text NOT NULL
);

CREATE TABLE choices
(
  id SERIAL PRIMARY KEY,
  question_id integer NOT NULL REFERENCES questions ON DELETE cascade,
  content text,
  content_type text NOT NULL,
  title text NOT NULL
);

CREATE TABLE votes
(
  choice_id integer NOT NULL REFERENCES choices ON DELETE cascade,
  username text NOT NULL REFERENCES users ON DELETE cascade,
  PRIMARY KEY (choice_id, username),
  score integer NOT NULL
);

CREATE VIEW users_votes AS
SELECT 
  username, 
  questions.survey_id,
  choices.question_id, 
  choice_id, 
  score 
FROM votes 
JOIN choices ON votes.choice_id = choices.id 
JOIN questions ON questions.id = choices.question_id;
