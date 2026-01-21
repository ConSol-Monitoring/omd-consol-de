---
author: Sven Nierlein
date: '2015-04-27'
tags:
- Nagios
title: Nagios/Icinga GeoMaps with Thruk
---

One of the most often requested features is the possibility to place hosts, services and host/servicegroups on a geomap.
Now with release 1.88 Thruk made a major change in its panorama dashboard to support this kind of map too.
<!--more-->

And thats how it looks like
---------------------------
![](geomaps.png)

The map data is based on <a href="http://www.openstreetmap.org">Openstreetmap</a> but it is possible to configure own wms provider to serve any kind of map tiles. Also new in this context are the weatherlines/arrow/connector items which draw an arrow or a line between two points. These two points can either be x/y coordinates or lon/lat geo coordinates. The size of this item can change according to performance data and the color changes according to the state of a host/service. Which makes them perfect for network connectivity indicators like in the example screenshot above.
<br style="clear:both">
You can navigate freely on the map and drag/pan and zoom into the map, even if the geomap dashboard are still designed to just make it super easy to organize geographical data. Drill down can be done by linking different maps with a higher zoom level.


The latest version can be downloaded for free at <a href="http://www.thruk.org">www.thruk.org</a>. There is also a <a href="http://demo.thruk.org">demo system</a> available if you just want to have a look first.

Important Features
------------------
* Drag/pan/zoom controls
* Easy placement of icons
* Configurable WMS provider
* Drill-down into other maps
* Weather-lines included
