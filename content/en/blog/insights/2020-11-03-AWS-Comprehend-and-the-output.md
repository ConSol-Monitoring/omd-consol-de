---
author: Lukas Höfer
date: '2020-11-03'
featured_image: /assets/2020-11-03-AWS-Comprehend-and-the-output.tar.gz/comprehend.jpg
meta_description: Let's transform Comprehnds output to something useful
tags:
- aws
title: AWS Comprehend and the output.tar.gz
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="{{page.featured_image}}"></div>

AWS Comprehend is a great tool when you want to extract information from textual data. As a managed service it is really easy to setup and can be used with next to no prior knowledge of machine learning.  But there is one minor thing that bugs me about Comprehend: The Output.

**TL;TR** output.tar.gz bad, flat json file good.    
See python code below for transformation.

<!--more-->

### The Problem
How come that for a managed service - in which the user can literally use Excel to create a simple csv file to train a machine-learning model - the output is just a link to an zipped archive in S3?   
Ok, well that does not sound like a real big problem, does it? But what if I told you that within this Archive lies one json-ish file in which each line represents one line of the input and within each line that has matches found by the model lies another json hierarchy which represents the actual matches.   You had trouble reading this sentence? Now image how hard it would be for the normal Excel user to bring this file into a queryable structure.

### What about the Documentation?
There are hidden suggestions in the Documentation and the AWS Blog, that this might in fact be an out of the box functionality. And nobody is really talking about what to do with the output, once the model has returned all this valuable information.

[The documentation](https://docs.aws.amazon.com/comprehend/latest/dg/tutorial-reviews-visualize.html) suggests that extracting the data and visualising it with QuickSight might be sufficient. While this may or may not be true for sentiment data, which I have not tested, it is most certainly not that straight forward for Custom Entities.

This otherwise [excellent Blog Article](https://aws.amazon.com/blogs/machine-learning/build-a-custom-entity-recognizer-using-amazon-comprehend/) simply skips this transformation and vaguely suggests that Glue an ETL Service and Athena a query tool might be the way to go. But sadly, this crawler configuration won't help either, unless the data is already in a flat format, which as of now it is not.


### Python to the rescue  
There are two steps to this problem, on which not much useful information can be found.

Step 1:  
Extract a tar file in S3.

Step 2:  
Transform the json file line by line into a usable flat format.

Setup:  
To run the following Code, I am using a Jupyter Notebook deployed via AWS SageMaker with the conda_python3 Kernel. As Jupyter Notebooks running python are the defacto standard for Datascience it is quite nice that AWS provides this as a Service. This ensures that all permissions are setup in advance. If you want to run this script locally you will have to provide some more boto3 configuration.

#### Step 1:  
Extract a tar file in S3. As of now, this cannot be done directly. So first download the file to the local drive of the Notebook Server, then extract and rename it.

```python
import s3fs
import tarfile
import os

#to download the file use s3fs, it is really handy and much more intuitive that the boto3 s3 client
fs = s3fs.S3FileSystem(anon=False)

#get the location of output.tar.gz
#returns 's3://<your_bucket_name>/custom-entities/output/<a_long_random_id>/output/output.tar.gz' 
output_uri = comprehend.describe_entities_detection_job(JobId=<your_job_id>)['EntitiesDetectionJobProperties']['OutputDataConfig']['S3Uri']
#we need to remove the the suffix
output_uri = output_uri.replace('s3://','')

#a folder to save our local outputs to
tmp='../tmp/'
#our exracted, but not yet flattened output
json_filename=tmp+'Entities.json')

fs.download(output_uri, tmp+'output.tar.gz')

#now simply extract  the local file
tar = tarfile.open(tmp+'output.tar.gz', "r:gz")
tar.extractall(path=tmp)
tar.close()

#give the file a propper name
os.rename(tmp+'output',json_filename)

#cleanup
os.remove(tmp+'output.tar.gz')
```

#### Step 2:   
To transform the json file we first need to understand its current format. Each Line is formatted as json and contains three keys:

* Entities - Empty array, if no matches where found; otherwise json
* File - The file which was used as input
* Line - The line in the file which was analysed

If there are Entities found in the line the Entities contain another json string containing:

* BeginOffset - Startposition of the match
* EndOffset - Endposition of the match
* Score - Quality of the match
* Text - The match that was found
* Type - The Entity of the match

We see here the results for the first three lines of *input.csv*. Line 0 and 2 have no matches, line 1 has two.

```json
{"Entities": [], "File": "input.csv", "Line": 0}
{"Entities": [{"BeginOffset": 4, "EndOffset": 10, "Score": 0.9999729402230112, "Text": "Podest", "Type": "BAUTEIL"}, {"BeginOffset": 30, "EndOffset": 37, "Score": 0.9999952316511552, "Text": "Fenster", "Type": "BAUTEIL"}], "File": "input.csv", "Line": 1}
{"Entities": [], "File": "input.csv", "Line": 2}
```

This format is human readable and is of course a good enough start to get a feeling for the results. But if we really want to work with it, the data should be in a flat structure that can easily be queried or joined with the contents of *input.csv*.   
The format I propose is:

```json
{"File": "input.csv", "Line": 0}
{"BeginOffset": 4, "EndOffset": 10, "Score": 0.9999729402230112, "Text": "Podest", "Type": "BAUTEIL", "Line": 1, "File": "input.csv"}
{"BeginOffset": 30, "EndOffset": 37, "Score": 0.9999952316511552, "Text": "Fenster", "Type": "BAUTEIL", "Line": 1, "File": "input.csv"}
{"File": "input.csv", "Line": 2}
```

Now the content of the Entities are separated, which gives us a flat format. This can now be imported using Glue or QuickSight, or most other analysis tools in fact.

To get from the extracted *Entities.json* to a flat file, simply continue with the following code:

```python
import json

#location of the flatetned output 
flat_json = tmp+'flat.json'

# open json-like file, that we have extracted in step 1
f = open(json_filename, 'r')

#variables for the parsed output document
doc=""
line_out=""

# read each line of the file
while True:
    line = f.readline()
    if not line: #don't forget to stop the loop ;)
        break
    else:
        #read each line as json
        j = json.loads(line)

        #if there are entities, write a line for each match
        if len(j['Entities']) > 0:
            line_out = ""
            for index, val in enumerate(j['Entities']):       
                val['Line']=j['Line']
                val['File']=j['File']
                line_out += json.dumps(val)+'\n'
            doc += line_out
        #if there is no entity, remove the key and add the rest
        else:
            j.pop('Entities')
            line_out = json.dumps(j)+'\n'
            doc += line_out

f.close()

# write the final output
f = open(flat_json, "w")
f.write(doc)
f.close()
print('flattened file written to ', flat_json)
```

So that's it. The same script can also be used for Comprehend's **Key Phrases** and **Topic Modelling**. Just replace the Key *'Entities'* with *'Topics'* or *'KeyPhrases'*.

I hope this will help you to save some time and I sure hope, that AWS will introduce a button for this export functionality, to ease the usage of their service to all our friends who are stuck with Excel.