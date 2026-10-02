CREATE TABLE Person (

    epost     VARCHAR(100) PRIMARY KEY,
    fornavn   VARCHAR(50),
    etternavn VARCHAR(50),
    telefon   VARCHAR(15)
);
INSERT INTO Person VALUES('kari@example.com','Kari',NULL,'+47 12 34 56 78');
INSERT INTO Person VALUES('ola@example.com','Ola','Nordmann','+47 23 45 67 89');
INSERT INTO Person VALUES('tux@example.com',NULL,NULL,NULL);
INSERT INTO Person VALUES('ny@example.com',NULL,NULL,NULL);
