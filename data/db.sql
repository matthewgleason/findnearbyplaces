
create schema if not exists imagequiz;

drop table if exists imagequiz.quiz_question;
drop table if exists imagequiz.quiz;
drop table if exists imagequiz.question;
drop table if exists imagequiz.category;
drop table if exists imagequiz.customer;
drop table if exists imagequiz.flower;



create table if not exists imagequiz.customer 
(
	id bigserial primary key,
	name text not null,
	email text not null unique,
	password text not null
);

create table if not exists imagequiz.question 
(
	id bigserial primary key,
	picture text not null,
	choices text not null,
	answer text not null
);

create table if not exists imagequiz.category 
(
	id bigserial primary key,
	name text not null
);

create table if not exists imagequiz.quiz 
(
	id bigserial primary key,
	name text not null,
	category_id int not null references imagequiz.category(id)
	
);

create table if not exists imagequiz.quiz_question
(
	quiz_id int references imagequiz.quiz(id),
	question_id int not null references imagequiz.question(id)
	
);

create table if not exists imagequiz.flower
(
	id bigserial primary key,
	name text not null,
	picture text not null
	
);