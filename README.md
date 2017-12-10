### phantom-bridge
HTTP Adapter to control the volume of Devialet Phantom Speakers

## Installation

* clone phantom-bridge
* Run `npm install require`
* Run `npm install node-ssdp`


## Config 
* open index.js with your favorite text-editor
* search for the `devialet_ipaddress` and rename this to the IP Adress of your Devialet Bridge
* save your changes
Note: It is recommend to set a fixed ip Adress for the bridge. You can do this within the webinterface of your Devialet bridge. This interface is located at http://"bridge_ip_adress":8000/


## Start the phantom-brdige
* Run `node index.js`
* Wait some seconds...

If everything works fine, you should see `Devialet bridge found at: ....` in your terminal window. 


## How to change the volume
The script will start a webserver on port 8080. If you want to set the volume to 35%, just open the following url:
`http://127.0.0.1:8080/?setVol=35`
You can set the volume from 0-100%. 
You can also increase or decrease the volume by the following commands:
Increase: `http://127.0.0.1:8080/?setVol=up`
Decrease: `http://127.0.0.1:8080/?setVol=down`

Note: The script doesnt read the volume from the devialet app at the moment. It´s just one-way communication. 


# Other
Make shure port 8080 and also 1900 is availible. You can change the port 8080 without problems, but you need 1900 to listen for the upnp messages for the bridge. The start will fail if these ports are used. 

I also tried to add functionality for Play/Pause/Stop/Prev/Next, but at this point it seams not to be implemented in the phantoms. 
