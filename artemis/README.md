# artemis-hawtio

Is a HawtIO plugin that allows the viewing and manipulation of topic/queues and other JMS resources in [ActiveMQ Artemis](http://activemq.apache.org/artemis).

## Using

For the ways how to deploy the plugin inside the broker, take a look at [user manual](docs/user-manual.md)


## Developing

One quick way to develop the plugin, without constant rebuild/restart cycle is to install the hawtio in the external web server.

For example in Tomcat, you can copy [HawtIO War](http://hawt.io/getstarted/) in the `$TOMCAT_HOME/webapps/` directory.

Then you can build (`mvn install`) and add the plugin as a symbolic link to the same directory
   
```   
ln -s $PLUGIN_SOURCE/artemis/target/artemis-plugin-VERSION artemis-plugin
```

To access the console with the plugin visit `http://localhost:8282/hawtio-web-VERSION`. You can now connect to the Artemis broker running in separate process.

After the code changes, just do `mvn install` and refresh your browser.



