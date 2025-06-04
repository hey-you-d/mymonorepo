CREATE DATABASE 'tasks-db'
  LC_COLLATE='en_US.utf8'
  LC_CTYPE='en_US.utf8'
  ENCODING='UTF8';

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL COLLATE "en_US.utf8",
  detail TEXT NOT NULL COLLATE "en_US.utf8",
  completed BOOLEAN DEFAULT FALSE, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  auth_type TEXT COLLATE "en_US.utf8" NOT NULL DEFAULT 'basic_auth',
  admin_access BOOLEAN DEFAULT FALSE,  
  email TEXT COLLATE "en_US.utf8" NOT NULL,
  hashed_pwd TEXT COLLATE "en_US.utf8" NOT NULL,
  jwt TEXT COLLATE "en_US.utf8" NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_email UNIQUE (email)  -- Enforce unique email addresses
);

-- unlike mysql, postgresql doesn't support 
-- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- the workaround is by creating a trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- implement the trigger fn on the users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
