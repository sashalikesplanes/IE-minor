# mqtt_setup.py
import adafruit_esp32spi.adafruit_esp32spi_socket as socket
import adafruit_minimqtt as miniMQTT
from timer import Timer

loop_timer = Timer()
loop_timer.set_duration(5)
loop_timer.start()

class MQTT():

    def __init__(self, wifi, state, timeofday):

        try:
            from settings import settings
        except ImportError:
            print("WiFi settings are kept in settings.py, please add or change them there!")
            raise
        self.energy = 0
        self.state = state
        self.timeofday = timeofday
        self.settings = settings
        self.wifi = wifi
        self.default_topic = "time-of-day"
        miniMQTT.set_socket(socket, self.wifi.esp)
        self.mqtt_client = miniMQTT.MQTT(
            broker=self.settings["broker"], port=1883, client_id = self.settings["clientid"]
        )

        self.mqtt_client.on_connect = self.connected
        self.mqtt_client.on_disconnect = self.disconnected
        self.mqtt_client.on_message = self.message

        print("Connecting to MQTT broker...")
        self.mqtt_client.connect()
        self.mqtt_client.publish("names", self.settings["displayname"] + "-" + settings["clientid"])

    def message(self, client, topic, message):
        if topic == "time-of-day":
#             print("day: ", int(message))
            self.timeofday = int(message)
            if int(message) == 0 and (self.state == 3 or self.state == 4):
                self.state = self.state - 2
            elif int(message) == 1 and (self.state == 1 or self.state == 2):
                self.state = self.state + 2
        elif topic == "energy-increment-"+self.settings["clientid"]:
            self.updateEnergy(int(message))
    #         print("New message on topic {0}: {1}".format(topic, message))

    ### MQTT connection functions ###
    def connected(self, client, userdata, flags, rc):
        print("Connected to MQTT broker! Listening for topic changes on %s" % self.default_topic)
        client.subscribe("time-of-day")
        client.subscribe("energy-increment-"+self.settings["clientid"])

    def disconnected(self, client, userdata, rc):
        print("Disconnected from MQTT Broker!")

    def updateEnergy(self, energy_level):
        self.energy = energy_level
        self.mqtt_client.publish("energy-level", self.settings["clientid"] + ", " + str(self.energy))

    def loop(self):
        if loop_timer.expired():
            loop_timer.start()
            try:
                self.mqtt_client.loop()
            except (ValueError, RuntimeError) as e:
                print("Failed to get data, retrying\n", e)
                self.wifi.reset()
                self.mqtt_client.reconnect()
