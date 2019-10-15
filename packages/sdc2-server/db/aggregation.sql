replace into dailyAggregation (measurementDay, location, type, count, sum, average, minimum, maximum)
  select
    DATE_FORMAT(createdAt, '%Y-%m-%d 00:00:00') as measurementDay,
    location,
    type,
    count(value)                                as count,
    sum(value)                                  as sum,
    avg(value)                                  as average,
    min(value)                                  as minimum,
    max(value)                                  as maximum
  from measurement
  group by measurementDay, location, type
  order by measurementDay;

replace into hourlyAggregation (measurementHour, location, type, count, sum, average, minimum, maximum)
  select
    DATE_FORMAT(createdAt, '%Y-%m-%d %H:00:00') as measurementHour,
    location,
    type,
    count(value)                                as count,
    sum(value)                                  as sum,
    avg(value)                                  as average,
    min(value)                                  as minimum,
    max(value)                                  as maximum
  from measurement
  group by measurementHour, location, type
  order by measurementHour;
