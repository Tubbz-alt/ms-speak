# MS-SPEAK Toolkit
The MS-SPEAK toolkit consists of three Qt-based components - MultiSpeaker (endpoint), MultiSpeakerServer (listener), and IdsEditor (business rule editor for the Intrusion Detection System built specifically to monitor MultiSpeak interfaces).


### MultiSpeaker
MultiSpeaker is a toolkit for generating test messages in [MultiSpeak](http://multispeak.org).

Sends messages. In the Windows Taskbar, next to MobaXterm: 
![](images/TaskbarMultiSpeaker.png)

Figure below shows the interface of MultiSPeaker with 'Function Blocks' in the left, 'Methods' in the right, and dedicated spaces in the middle for specifying 'Topology', 'Timeline' and 'Events'. 
![](images/MultiSpeakerOpening.png)

Click on the proxy editor (icon present above the 'Methods' column) and set up the proxy address.
![](images/MultiSpeakerProxy.png)

If the methods don't show up in the 'Methods' column in the right, then click on 'WSDLs' to select the appropriate WSDL files from 'CD_Server.wsdl'.
![](images/OpenWSDL.png)

Select the function from the left 'Function Blocks' column (here we have selected 'CD Connect / Disconnect'). Click the appropriate method from the 'Methods' column in the right (here we have clicked on 'InitateConnectDisconnect') in order to edit the timeline and event. 
![](images/MultiSpeaker.png)

![](images/EditTimeLineEvent.png)


### MultiSpeakerServer

The MultiSPeakerServer listens for MultiSpeak messages and receives messages. 

In the Windows Taskbar, next to MobaXterm: ![](images/TaskbarMultiSpeakerServer.png)
![](images/MultiSpeakerServer.png)

Set up the HTTP IP and port address.
![](images/MultiSpeakerHTTP.png)


### IdsEditor
PNNL has decveloped an open-source intrusion detection system (IDS) for MultiSpeak interfaces. The IdsEditor is the interface that is used to configure business rules. 
It is possible to add, edit or delete business rules. The existing business rule editor serves as a simple example where it is possible to add acceptable temperature range, time range in a day, and number of maximum requests in a day. It is also possible to select the method, and endpoints.


In the Windows Taskbar, next to MobaXterm: ![](images/TaskbarIdsEditor.png)

Click on edit to be able to change the business rules.
![](images/IdsEditor.png)

In the business rule editor currently the maximum number of requests in a day, the minimum and maximum temperatures within which remote connect and disconnect can be initiated, and the time range within which remote connect and disconnect can be initiated can be readily configured.
![](images/IdsEditorEdit.png)

