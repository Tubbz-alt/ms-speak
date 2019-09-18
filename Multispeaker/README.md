# MultiSpeaker

MultiSpeaker is a toolkit for generating test messages in [MultiSpeak](http://multispeak.org).


### MultiSpeaker

Sends messages. In the Windows Taskbar, next to MobaXterm: ![](images/TaskbarMultiSpeaker.png)

The interface of MultiSPeaker with 'Function Blocks' in the left, 'Methods' in the right, and dedicated spaces in the middle for specifying 'Topology', 'Timeline' and 'Events'. 
![](images/MultiSpeakerOpening.png)

Click on the proxy editor (icon present above the 'Methods' column) and set up the proxy address.
![](images/MultiSpeakerProxy.png)

If the methods don't show up in the 'Methods' column in the right, then click on 'WSDLs' to select the appropriate WSDL files from 'CD_Server.wsdl'.
![](images/OpenWSDL.png)

Select the function from the left 'Function Blocks' column. Here we have selected 'CD Connect / Disconnect'. Click the appropriate method from the 'Methods' column in the right (here we have clicked on 'InitateConnectDisconnect') in order to edit the timeline and event. 
![](images/MultiSpeaker.png)

![](images/EditTimeLineEvent.png)


### MultiSpeakerServer

Receives messages. In the Windows Taskbar, next to MobaXterm: ![](images/TaskbarMultiSpeakerServer.png)
![](images/MultiSpeakerServer.png)

Set up the HTTP IP and port address.
![](images/MultiSpeakerHTTP.png)


### IdsEditor

Used to configure business rules. In the Windows Taskbar, next to MobaXterm: ![](images/TaskbarIdsEditor.png)
![](images/IdsEditor.png)
Click on edit to be able to change the business rules.

In the business rule editor currently the maximum number of requests in a day, the minimum and maximum temperatures within which remote connect and disconnect can be initiated, and the time range within which remote connect and disconnect can be initiated can be set.
![](images/IdsEditorEdit.png)

