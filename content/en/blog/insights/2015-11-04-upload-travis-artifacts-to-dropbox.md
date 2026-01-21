---
author: Sven Nierlein
date: '2015-11-04T16:00:00+02:00'
featured_image: /assets/2015-11-04-upload-travis-artifacts-to-dropbox/finder.png
tags:
- Travis
title: Upload Travis Artifacts to Dropbox
---

[__Travis CI__](http://travis-ci.org/) is a free platform for continues integration tests which fits perfectly in our opensource products workflow with [__Github__](https://github.org/). Unfortunately it only supports uploading artifacts to amazon aws. Usually not a major problem, because most tests result in simple text output.
Latest [__Thruk__](http://thruk.org/) Tests however are based on [__Sakuli__](https://www.consol.de/it-services/it-consulting/open-source-monitoring/sakuli/) and [__Docker__](http://docker.io/) and produce screenshots on errors because we do full enduser gui tests of the dashboard and other javascript based parts. So we need a way to store these screenshots on [__Dropbox__](https://www.dropbox.com/). <!--more-->


## Preparation

### Dropbox Uploader

First thing you need is a dropbox account with an API application. Just follow the [__Dropbox Commandline__](http://xmodulo.com/access-dropbox-command-line-linux.html) guide.
Then run the Dropbox uploader once to make sure it's working. You will have to authorized your newly created application on the
first run by hitting the oauth url. After that you will have a new file `~/.dropbox_uploader` in you home folder which contains
the api keys, api secrets and tokens necessary to upload files. You may want to try uploading a sample file before continuing
to the next step:

```bash
%> ./dropbox_uploader.sh upload testfile /
 > Uploading ".../testfile" to "/testfile"... DONE
```


### Travis

Since the `~/.dropbox_uploader` contains everything to access your dropbox files, you do **not** want to **publish** that file. At least
not unencrypted. Luckily Travis offers a way to use encrypted files during the tests. Therefor we have to install the Travis gem.

Change into your project folder and install the Travis gem.

```bash
%> GEM_HOME=.gem gem install travis
```

Then login into travis and encrypt the secrets file with these commands:

```bash
%> GEM_HOME=.gem ./.gem/bin/travis login --auto
%> GEM_HOME=.gem ./.gem/bin/travis encrypt-file ~/.dropbox_uploader
```

You should now have a `.dropbox_uploader.enc` file. Add this file together with
the `dropbox_uploader.sh` from the first previous step to your repository.



## Using dropbox_uploader in your .travis.yml

Finally add a new step in the `before_install:` step of your `.travis.yml` using the encrypted keys from the `encrypt-file`
step above. The if clause makes sure the decryption only runs if the secure environment variables do exist, because this
will not work on pull requests due to security issues.

```
before_install:
  - '[ "$TRAVIS_SECURE_ENV_VARS" == "false" ] || openssl aes-256-cbc -K $encrypted_..._key -iv $encrypted_..._iv -in .dropbox_uploader.enc -out ~/.dropbox_uploader -d'
```

Then add a post script which runs when there were errors during the test which then uploads the screenshots to dropbox.
In our case the screenshots were stored in `t/results`. The if clause will make sure the upload will only be started if
the decryption above succeeded.

```
after_failure:
  - '[ -f ~/.dropbox_uploader ] && ./dropbox_uploader.sh upload t/results/ travis-artifacts/$TRAVIS_JOB_NUMBER/'
```

## Check the results

After a failed build you can now examine your logfiles and screenshots in your Dropbox folder:

![Travis Artifacts in Finder](/assets/2015-11-04-upload-travis-artifacts-to-dropbox/finder.png)