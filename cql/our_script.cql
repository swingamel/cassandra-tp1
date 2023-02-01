# Create two keyspaces: xx_demo1 and xx_demo2.
CREATE KEYSPACE [IF NOT EXISTS] xx_demo1 WITH replication = {
'class': 'NetworkTopologyStrategy', 
'datacenter1': 3, 
'datacenter2': 3, 
'datacenter3': 3
};

CREATE KEYSPACE [IF NOT EXISTS] xx_demo2 WITH replication = {
'class': 'NetworkTopologyStrategy', 
'datacenter1': 3, 
'datacenter2': 3, 
'datacenter3': 3
};

# Create column families inside of each, xx_cfdemoN with N being its number.
# Use one of each data type to test them, column names xx_colN with N being its number.
# Use UUIDs
# Use collections and tuples.
# Use custom data types.
# Use simple and composite primary keys. 
# Use simple and multiple clustering orders.
USE xx_demo1;
CREATE COLUMNFAMILY xx_cfdemo1 (
    key UUID PRIMARY KEY,
    xx_col1 text,
    xx_col2 int,
    xx_col3 float,
    xx_col4 set<text>,
    xx_col5 map<text, int>,
    xx_col6 tuple<text, int>,
    xx_col7 custom_type
) WITH CLUSTERING ORDER BY (xx_col2 DESC);

USE xx_demo2;
CREATE COLUMNFAMILY xx_cfdemo2 (
    key UUID PRIMARY KEY,
    xx_col1 text,
    xx_col2 int,
    xx_col3 float,
    xx_col4 set<text>,
    xx_col5 map<text, int>,
    xx_col6 tuple<text, int>,
    xx_col7 custom_type,
    xx_col8 int,
    xx_col9 float,
) WITH CLUSTERING ORDER BY (xx_col2 DESC, xx_col8 ASC);

# Insert some data
USE xx_demo1;
INSERT INTO xx_cfdemo1 (key, xx_col1, xx_col2, xx_col3, xx_col4, xx_col5, xx_col6, xx_col7)
VALUES (uuid(), 'value1', 1, 1.1, {'set1', 'set2'}, {'map1': 1, 'map2': 2}, ('tuple1', 1), {'field1': 'value1', 'field2': 'value2'});
INSERT INTO xx_cfdemo1 (key, xx_col1, xx_col2, xx_col3, xx_col4, xx_col5, xx_col6, xx_col7)
VALUES (uuid(), 'value2', 2, 1.2, {'set3', 'set4'}, {'map1': 3, 'map2': 4}, ('tuple1', 2), {'field1': 'value3', 'field2': 'value4'});
INSERT INTO xx_cfdemo1 (key, xx_col1, xx_col2, xx_col3, xx_col4, xx_col5, xx_col6, xx_col7)
VALUES (uuid(), 'value3', 3, 1.3, {'set5', 'set6'}, {'map1': 5, 'map2': 6}, ('tuple1', 3), {'field1': 'value5', 'field2': 'value6'});

USE xx_demo2;
INSERT INTO xx_cfdemo2 (key, xx_col1, xx_col2, xx_col3, xx_col4, xx_col5, xx_col6, xx_col7, xx_col8, xx_col9)
VALUES (uuid(), 'value1', 1, 1.1, {'set1', 'set2'}, {'map1': 1, 'map2': 2}, ('tuple1', 1), {'field1': 'value1', 'field2': 'value2'}, 2, 2.1);
INSERT INTO xx_cfdemo2 (key, xx_col1, xx_col2, xx_col3, xx_col4, xx_col5, xx_col6, xx_col7, xx_col8, xx_col9)
VALUES (uuid(), 'value2', 2, 1.2, {'set3', 'set4'}, {'map1': 3, 'map2': 4}, ('tuple1', 2), {'field1': 'value3', 'field2': 'value4'}, 4, 2.2);
INSERT INTO xx_cfdemo2 (key, xx_col1, xx_col2, xx_col3, xx_col4, xx_col5, xx_col6, xx_col7, xx_col8, xx_col9)
VALUES (uuid(), 'value3', 3, 1.3, {'set5', 'set6'}, {'map1': 5, 'map2': 6}, ('tuple1', 3), {'field1': 'value5', 'field2': 'value6'}, 6, 2.3);

# Create a materialized view.
CREATE MATERIALIZED VIEW xx_view
AS SELECT * FROM xx_demo1.xx_cfdemo1
WHERE xx_col1 IS NOT NULL
PRIMARY KEY (column1)
WITH CLUSTERING ORDER BY (xx_col2 DESC);

# Use simple select queries
SELECT * FROM xx_demo1.xx_cfdemo1 WHERE xx_col1 = 'value1';

# Use in()
SELECT * FROM xx_cfdemo1 WHERE xx_col1 IN ('value1', 'value2');

# Use count(), max(), avg(), min(), sum() on a numeric column
SELECT count(xx_col2), max(xx_col2), avg(xx_col2), min(xx_col2), sum(xx_col2) FROM xx_demo1.xx_cfdemo1;

# Use limit
SELECT * FROM xx_demo1.xx_cfdemo1 WHERE xx_col1 = 'value1' ORDER BY xx_col2 DESC LIMIT 10;

# Use range
SELECT * FROM xx_cfdemo1 WHERE xx_col2 > 1 AND xx_col2 < 3;
SELECT * FROM xx_cfdemo1 WHERE xx_col1 >= 'value1' AND xx_col1 < 'value3';

# Use comparaison
SELECT * FROM xx_cfdemo1 WHERE xx_col2 > 1;

# Add indexes
USE xx_demo1;
CREATE INDEX xx_col2_index ON xx_cfdemo1 (xx_col2);

USE xx_demo2
CREATE INDEX ON xx_cfdemo2 (xx_col2, xx_col8);

# Use allow filtering
SELECT * FROM xx_cfdemo1 WHERE xx_col1 = 'value1' ALLOW FILTERING;

# Delete / update collection data (one by one)
DELETE xx_col4['set1'] FROM xx_cfdemo1 WHERE xx_col2 = 1;
UPDATE xx_cfdemo1 SET xx_col5['map1'] = 10 WHERE xx_col2 = 1;

# Create custom indexes and try SASI queries
CREATE CUSTOM INDEX xx_col1_idx ON xx_cfdemo1 (xx_col1) USING 'org.apache.cassandra.index.sasi.SASIIndex';

SELECT * FROM xx_cfdemo1 WHERE xx_col1 LIKE '%value%' ALLOW FILTERING;
SELECT * FROM xx_cfdemo1 WHERE xx_col1 CONTAINS 'value1' ALLOW FILTERING;
SELECT * FROM xx_cfdemo1 WHERE xx_col1 STARTS WITH 'value' ALLOW FILTERING;
SELECT * FROM xx_cfdemo1 WHERE xx_col1 CONTAINS KEY 'value' ALLOW FILTERING;

# Test changing the bloom filter on a table
ALTER TABLE xx_cfdemo2 WITH bloom_filter_fp_chance = 0.1;

# Use nodetool to repair a table
nodetool repair xx_demo1 xx_cfdemo1

# Shutdown two nodes out of three and try inserting/selecting with quorum.
nodetool stop