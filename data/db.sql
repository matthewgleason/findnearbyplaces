
create schema if not exists findplaces;



create table if not exists findplaces.customer 
(
	id bigserial primary key,
	email text not null unique,
	password text not null
);

create table if not exists findplaces.place
(
	id bigserial primary key,
	name text not null,
	latitude int not null,
	longitude int not null, 
	description text not null, 
	category_id int references findplaces.category(id),
	customer_id int references findplaces.customer(id)
);

create table if not exists findplaces.category 
(
	id bigserial primary key,
	name text not null
);

create table if not exists findplaces.reviews
(
	id bigserial primary key,
	location_id int references findplaces.place(id),
	customer_id int references findplaces.customer(id)
	text text not null,
	rating int not null
	
);

create table if not exists findplaces.photo
(
	id bigserial primary key,
	file bytea not null
);

create table if not exists findplaces.place_photo
(
	location_id int references findplaces.place(id),
	photo_id int references findplaces.photo(id)
	
);
create table if not exists findplaces.review_photo
(
	review_id int references findplaces.reviews(id),
	photo_id int references findplaces.photo(id)
	
);