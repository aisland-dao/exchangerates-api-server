use exchangerates;
CREATE TABLE currencies (
  id varchar(10) NOT NULL,
  name varchar(64) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE exchangerates (
  id int not null auto_increment,
  refcurrency varchar(10) NOT NULL,
  currency varchar(10) NOT NULL,
  exchangerate numeric(12,2) NOT NULL,
  dtupdate datetime NOT NULL,
  PRIMARY KEY (id)
);
