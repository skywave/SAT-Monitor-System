\* Core Requirements for SAT Monitor System



Monitor trunks (VoIP lines).

Log ping/status checks (network health).

Store alerts if something goes wrong.

Possibly store users/administrators who view the system.

Keep timestamps of all events.

Track system configuration (optional, e.g., thresholds for alerts).



So the schema should have tables for:

-trunks

-ping\_logs

-trunk\_status

-alerts

-users (mandatory)

-settings (optional)







Suggested Tables \& Columns



Table 1: trunks

Stores all trunks being monitored.

Column Name	Type	Notes
trunk\_id	SERIAL PRIMARY KEY	Unique ID for each trunk
name	VARCHAR(50)	Friendly name for trunk
ip\_address	VARCHAR(15)	IP of the trunk or endpoint
status	VARCHAR(20)	'up', 'down', 'unknown'
last\_checked	TIMESTAMP	Last time this trunk was monitored
created\_at	TIMESTAMP	Default: now()
updated\_at	TIMESTAMP	Default: now()



Table 2: ping\_logs

Stores ping results for trunks or network devices.

Column Name	Type	Notes
ping\_id	SERIAL PRIMARY KEY	Unique ID
trunk\_id	INT REFERENCES trunks(trunk\_id)	Which trunk/device
response\_time\_ms	INT	Round-trip time in milliseconds
status	VARCHAR(20)	'success', 'timeout', 'failed'
created\_at	TIMESTAMP	Time of ping



Table 3: trunk\_status

Optional table if you want historical status logs instead of just current status in trunks.

Column Name	Type	Notes
status\_id	SERIAL PRIMARY KEY	Unique
trunk\_id	INT REFERENCES trunks(trunk\_id)	Trunk ID
status	VARCHAR(20)	'up', 'down'
checked\_at	TIMESTAMP	Time of status check
notes	TEXT	Optional messages



Table 4: alerts

Stores alerts triggered when trunks go down or pings fail.

Column Name	Type	Notes
alert\_id	SERIAL PRIMARY KEY	Unique alert ID
trunk\_id	INT REFERENCES trunks(trunk\_id)	Which trunk
alert\_type	VARCHAR(50)	'ping\_failed', 'trunk\_down', etc.
severity	VARCHAR(20)	'low', 'medium', 'high'
description	TEXT	Optional description
created\_at	TIMESTAMP	When alert was triggered
resolved\_at	TIMESTAMP	Null if not resolved



Table 5: users (if multi-user system)
Column Name	Type	Notes
user\_id	SERIAL PRIMARY KEY	Unique user ID
username	VARCHAR(50)	Login name
password\_hash	VARCHAR(255)	Hashed password
role	VARCHAR(20)	'admin', 'viewer', etc.
created\_at	TIMESTAMP	Account created
last\_login	TIMESTAMP	Last login time



Table 6: settings (optional)

Column Name	Type	Notes
setting\_id	SERIAL PRIMARY KEY	Unique
name	VARCHAR(50)	e.g., 'ping\_timeout\_ms'
value	VARCHAR(50)	e.g., '500' (ms)
description	TEXT	Optional
updated\_at	TIMESTAMP	Last updated



* Relationships Overview

One-to-Many: trunks → ping\_logs (a trunk has many ping logs)

One-to-Many: trunks → alerts (a trunk can trigger multiple alerts)

One-to-Many: trunks → trunk\_status (historical status changes)



