# How to publish this piece.

You need two `.sde` files. One to connect to the **SGID** named `SGID10.sde` and another to the **address point** editing database called `Address.sde`.

When publishing this piece from an `.sd` file, I've noticed that the `.sde` connections do not get copied **at all**. Therefore I copied them into `C:\arcgisserver\directories\arcgissystem\arcgisinput\Broadband\DownloadTool.GPServer` and it _gitworked_!? Also when publishing an `.sd` file, you cannot overwrite the existing service so you must **delete it first**. 

Publishing the service from a `GP Result` allows you to overwrite the service. 