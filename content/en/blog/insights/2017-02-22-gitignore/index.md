---
author: Christian Guggenmos
date: '2017-02-22T00:00:00+00:00'
featured_image: /assets/2017-02-17-gitignore/git_log.png
tags:
- git
title: Using .gitignore the Right Way
---

<div style="position: relative; float: right; margin-right: 1em; margin-bottom: 1em;"><img src="git_logo.png" alt=""></div>

Have you ever wondered what kind of patterns `.gitignore` allows? Was it `**/*/target`, `target/*` or `*target*`?? Read on and find out!

<!--more-->

## Motivation

Everyone who uses [Git](https://git-scm.com) sooner or later has to define a `.gitignore` in a newly created project. We simply don't want to version control everything, especially generated files like Maven's `target` or Gradle's `build` folder. So how exactly can we specify which files to exclude? Can we use Ant-style syntax like `**/*`, simple Wildcards `*target` or even Regex `[a-z]{0,3}`?

## The Truth

There is only one source of truth. The official Git documentation on `gitignore`: [https://git-scm.com/docs/gitignore](https://git-scm.com/docs/gitignore)

If only people would read this before posting to [Stackoverflow](https://stackoverflow.com/search?q=gitignore)...

As it turns out Git does not use regex, nor wildcards, nor Ant-style syntax, but unix glob patterns (specifically those valid for `fnmatch(3)`). Don't worry, you don't need to read the `fnmatch(3)` documentation, simply refer to the tables in the next sections.

### The Most Important Use Cases

First things first, how can we exclude every `target` folder created by Maven in every sub-module?

The answer is very easy: `target/`  
This will match any directory (but not files, hence the trailing `/`) in any subdirectory relative to the `.gitignore` file. This means we don't even need any `*` at all.

Here is an overview of the most relevant patterns:

_.gitignore_ entry   | Ignores every...
---------------------|---------
_target/_ | ...**folder** (due to the trailing _/_) recursively
_target_ | ...**file or folder** named _target_ recursively
_/target_ | ...**file or folder** named _target_ in the top-most directory (due to the leading _/_)
_/target/_ | ...**folder** named _target_ in the top-most directory (leading and trailing _/_)
_*.class_ | ...every **file or folder** ending with _.class_ recursively

### Advanced Use Cases

For more complicated use cases refer to the following table:

_.gitignore_ entry   | Ignores every...
---------------------|---------
_#comment_ | ...nothing, this is a comment (first character is a _#_)
_\\#comment_ | ...every file or folder with name _#comment_ (_\\_ for escaping)
_target/logs/_ | ...every folder named _logs_ which is a subdirectory of a folder named _target_
_target/*/logs/_ | ...every folder named _logs_ two levels under a folder named _target_ (_*_  **doesn't** include _/_)
_target/**/logs/_ | ...every folder named _logs_ somewhere under a folder named _target_ (_\*\*_ includes _/_)
_*.py[co]_ | ...file or folder ending in _.pyc_ or _.pyo_. However, it doesn't match _.py_!
_!README.md_ | Doesn't ignore any _README.md_ file even if it matches an exclude pattern, e.g. _\*.md_. <br> **NOTE** This does not work if the file is located within a ignored folder.

### Examples

#### Maven based Java project

```
target/
*.class
*.jar
*.war
*.ear
*.logs
*.iml
.idea/
.eclipse
```

#### Important Dot Files in Your Home Folder

```
# ignore everything ...
/*
# ... but the following
!/.profile
!/.bash_rc
!/.bash_profile
!/.curlrc
```


## Wait, There's More

There are several locations where Git looks for ignore files. Besides looking in the root folder of a Git project, Git also checks if there is a `.gitignore` in every subdirectory. This way you can ignore files on a finer grained level if different folders need different rules.

Moreover, you can define repository specific rules which are **not committed** to the Git repository, i.e. these are specific to your **local copy**. These rules go into the file `.git/info/exclude` which is created by default in every Git repository with no entries.

One useful file you can define yourself is a **global ignore** file. It doesn't have a default location or file name. You can define it yourself with the following command:

```
git config --global core.excludesfile ~/.gitignore_global
```

Every rule which goes into this file applies to every Git repository in your user account. This is especially useful for OS-specific files like `.DS_Store` on MacOS or `thumbs.db` on Windows.

## Conclusion

As we have seen it is fairly easy to ignore files and folders for the typical use cases. Even though ignore rules don't support regex, `gitignore` is highly flexible and can be adapted to more complicated project structures using unix globs and different files on different levels.

So now you know. Go ahead, rework your existing `.gitignore` files and add a global ignore file to you system!

## More Resources

For each and every detail on `gitignore` refer to these resources.

- [GitHub collection of gitignore files](https://github.com/github/gitignore)
- [Git's gitignore file](https://github.com/git/git/blob/master/.gitignore)