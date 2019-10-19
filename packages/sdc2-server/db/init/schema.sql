create table apiKey
(
	id int auto_increment
		primary key,
	token varchar(36) not null,
	canRead tinyint(1) default '0' not null,
	canWrite tinyint(1) default '0' not null,
	comment varchar(256) default '' not null,
	constraint apiKey_token_uindex
		unique (token)
);

create table dailyAggregation
(
	id int auto_increment
		primary key,
	measurementDay datetime not null,
	location varchar(64) not null,
	type varchar(64) not null,
	count int not null,
	sum decimal(13,4) not null,
	average decimal(13,4) not null,
	minimum decimal(13,4) not null,
	maximum decimal(13,4) not null,
	constraint dailyAggregation_id_uindex
		unique (id),
	constraint dailyAggregation_measurementDay_location_type_uindex
		unique (measurementDay, location, type)
);

create table hourlyAggregation
(
	id int auto_increment
		primary key,
	measurementHour datetime not null,
	location varchar(64) not null,
	type varchar(64) not null,
	count int not null,
	sum decimal(13,4) not null,
	average decimal(13,4) not null,
	minimum decimal(13,4) not null,
	maximum decimal(13,4) not null,
	constraint hourlyAggregation_id_uindex
		unique (id),
	constraint hourlyAggregation_measurementHour_location_type_uindex
		unique (measurementHour, location, type)
);

create table measurement
(
	id int auto_increment
		primary key,
	location varchar(64) not null,
	createdAt datetime(3) not null,
	type varchar(64) not null,
	value decimal(13,4) not null,
	constraint measurement_id_uindex
		unique (id)
);

create index measurement_location_createdAt_type_index
	on measurement (createdAt, location, type);

create index measurement_location_type_index
	on measurement (location, type);
