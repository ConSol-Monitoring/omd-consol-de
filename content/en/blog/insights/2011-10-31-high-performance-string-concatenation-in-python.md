---
author: Gerhard Laußer
date: '2011-10-31T23:41:13+00:00'
slug: high-performance-string-concatenation-in-python
tags:
- Python
title: High performance string concatenation in Python
---

During evaluation of the migration of a customer's Nagios installation to the Shinken monitoring system, i encountered a strange problem. Reading the configuration from a few files (hosts.cfg, services.cfg, etc) took a reasonable amount of time. But as soon as i divided the configuration into lots of smaller files (one directory for each host with several services files within), it took nearly an hour. What happened?

<!--more-->

In Shinken, all the configuraton files are read into one single string. The extremely simplified code (which is run by the arbiter process) looks like this:
```python
res = u''
for cfg_file_name in list_of_all_config_files:
    fd = open(cfg_file_name, 'rU')
    res += fd.read()
    fd.close()
return res
```
After the for-loop, the string-variable res contains the contents of all the single config files.

It is important to know that a string in Python is an immutable data type. This means that if a string is created, it can not be modified any more.
Appending to the end of a string requires the creation of a new string and copying both the original string and the appendix to the new location. Now it is clear, why the loop shown above takes so long.
<pre>
iteration1: allocate very_short_string
            copy empty_string + stuff to very_short_string
iteration2: allocate short_string
            copy very_short_string + stuff to short_string
iteration3: allocate not_so_short_string
            copy short_string + stuff to not_so_short_string
...
iterationm: allocate long_string
            copy not_so_long_string + stuff to long_string
iterationn: allocate very_long_string
            copy long_string + stuff to very_long_string
...
</pre>

The more iterations there are, the more costly it is to fill the resulting string.
We can avoid this by using another type of string.

The StringIO class is a file although it's contents are not written to a disk, but to an area in main memory. Appending to it is simply done by calling the write() method, which adds text to the end of the "file".
Using this technique, the code above can be rewritten as:

```python
res = StringIO.StringIO
for cfg_file_name in list_of_all_config_files:
    fd = open(cfg_file_name, 'rU')
    res.write(fd.read())
    fd.close()
contents = res.getvalue()
res.close()
```
This code beats the old one easily when it comes to performance. After i patched the Shinken arbiter, the time necessary to process the thousands of config files dropped dramatically.


httpvh://www.youtube.com/watch?v=RUrWL-FBPvs