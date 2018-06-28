// setup for movie template

CREATE CONSTRAINT ON (n:Movie) ASSERT n.id IS UNIQUE;

CREATE CONSTRAINT ON (n:Person) ASSERT n.id IS UNIQUE;

