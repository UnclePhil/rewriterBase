Rewriter
========
This is a simple url rewriter 
It does only this but it does well.

I use this in  production with more than 500 rewriting rules and i never stopped the server.

Be careful, the 2 config files MUST exist before the launch of the program
If not, the server is crashing 


Requirements
* Node js > 0.4.x

Running (linux preferred)
	nohup node pxy.js >/var/log/pxy.log &
	
personally i protect it with a nginx, but i'm sure you can do without it

Features:
* You can change the listening port (8080)
* You can change all messages
* You can change the (basic) rest Url who's giving the list of rewriting rules

Not in:
* Statistics
* Rest CRUD 

If you have time to work on, please do.

Ph Koenig - aka Unclephil
http://tc.unclephil.net