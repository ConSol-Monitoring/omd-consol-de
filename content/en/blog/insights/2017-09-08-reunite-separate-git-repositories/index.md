---
author: Markus Hansmair
date: '2017-09-08T00:00:00+00:00'
featured_image: git_log.png
tags:
- git
title: Reunite separate git repositories
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="git_logo.png" alt=""></div>

I recently had to deal with two projects that have a common origin but separated at some point in time. I now had to try to bring them back together again - basically merging the changes. Sounds like a pretty standard `git merge` or `git rebase` job.

Unfortunately the separation was done in a not so clever way. Someone cloned the original repository, checked out some branch, made some first refactoring steps, got rid of the git stuff (probably `rm -rf .git`) and started a new git repository with this status. Rumors are that the situation at that time was so tense that people wanted to make a clear cut - which they did in a technical way.

Quite some time later it was my task to try to get the projects together again. The only input I had was two git URLs and the above story.

<!--more-->

So for the rest of this post lets call the original project project_a. The offspring (I intentionally avoid the term *fork*) be project_b.

My task basically consisted of four parts:

* TOC
{:toc}


## Get both projects into one repository

    git clone http://<some_server>/<some_path>/project_a.git
    cd project_a
    git remote add project_b http://<another_server>/<another_path>/project_b.git
    git fetch project_b
    git checkout -b project_b project_b/master

So what we get here is a repository with two unrelated histories.


## Find out what commit of project_a was the origin of project_b

    git log | tail

delivers the SHA1 checksum of the very first commit of project_b and its timestamp. Let's say

    e10b02232784d031a0beb053be0198bf7f40205c

and

    2012-09-21

Switch back to project_a

    git checkout master

and do

    for c in $(git log --format=format:%H --before=2012-09-23 --max-count=100); do
    > echo $c
    > git diff $c e10b02232784d031a0beb053be0198bf7f40205c | wc -l
    > done

This produces an output about the commits on master (i.e. project_a) and how much they differ from `e10b02232784d031a0beb053be0198bf7f40205c`. Here the least differing commit is identified as `cb5f9190f75f336761c984f57c34c8fcc346875b`.


## Create an ancestry between the two projects

(Up to this point it was not so special. You can sort that out with some moderate knowledge of git and shell programming (and of course some superfiscial googling). Glueing together two unrelated histories turned out to be a bit more tricky. I was not able to find a recipe on Google. This is why I wrote this post.)

filter-branch (git's swiss army knife) to the rescue:

    git checkout project_b/master
    git filter-branch --commit-filter '
    if [ $# -eq 1 ]; then
    git commit-tree -p cb5f9190f75f336761c984f57c34c8fcc346875b $1;
    else
    git commit-tree "$@";
    fi' HEAD

So what's happening here? First switch back to the branch containing project_b. Then iterate over all existing commits of this branch (least recent first) and apply the given little shell script

    if [ $# -eq 1 ]; then
        git commit-tree -p cb5f9190f75f336761c984f57c34c8fcc346875b $1
    else
        git commit-tree "$@"
    fi

For each commit the script is called with the command line parameters

    <TREE_ID> [(-p <PARENT_COMMIT_ID>)...]

the log message given on STDIN and the environment variables

    GIT_AUTHOR_NAME
    GIT_AUTHOR_EMAIL
    GIT_AUTHOR_DATE
    GIT_COMMITTER_NAME
    GIT_COMMITTER_EMAIL
    GIT_COMMITTER_DATE

set appropriately. All this input fits nicely for the command `git commit-tree`. This is what we do for the majority of all commits in the else clause of the above script. We simply replace those commits by new commits with the very same commit data (except one little change - see below).

The only special case is about the very first commit. It's recognized by the absense of any parent commit (i.e. any `-p` parameter missing, i.e. number of parameters of the script is 1, i.e. `$# -eq 1`). In this case we artificially add the commit identified earlier as the most probable parent commit (`-p cb5f9190f75f336761c984f57c34c8fcc346875b`).

And voila: The previously unrelated histories now have a common ancestor.


## Get the changes from one project into the other

Now you can happily apply `git merge` or `git rebase` to get the changes from one project (i.e. branch) into the other. I leave the details to the interested reader.


## Some final notes
{:.no_toc}

It's worth mentioning that actually all commits of branch project_b/master get changed as you can see by the changed SHA1 checksums. The change with the first commit is obvious - we add a new parent. The SHA1 checksum changes consequently. Semantically the following commits do not change. BUT: As the very first commit is the parent of the second commit and the first commit's SHA1 has changed so changes the SHA1 of the parent of the second commit. Consequently the second commit also gets another SHA1. And so on for the third commit, the 4th commit, etc.

In the above use of `git filter-branch --commit-filter` I tried to separated the called script into a distinct script file and reference this file as parameter of `--commit-filter`. This didn't work for reasons I couldn't figure out. Seems git is doing strange things when invoking what follows after `--commit-filter`. So I ended up with the given multi-line statement.