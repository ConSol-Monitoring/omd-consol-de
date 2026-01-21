---
author: Christian Guggenmos
date: '2015-06-23'
tags:
- git
title: Git, the safety net for your local work in progress
---

Just recently I gave a presentation on [Git](https://git-scm.com/) (the version control system, not the [British pejorative](https://git.wiki.kernel.org/index.php/Git_FAQ#Why_the_.27Git.27_name.3F)). I introduced newbies to the Git world and the concepts behind it and demonstrated advanced users some lesser known Git features.

Additionally, I introduced my __personal workflow__ when working on small scale features, let's say the size of one commit to the main line. Some of my colleagues found this workflow to be particularly interesting, so I'd like to share it here and discuss its benefits and drawbacks.
<!--more-->

Since I trust the reader's competent knowledge of [Git basics](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository), I will not explain any git commands in this blog post.

### Local workflow with `merge --squash`

#### Prerequisites

The workflow I'll describe should only be applied to features that fulfill the following conditions:

- Up to one or a few days of work
- More than 30 minutes of work

Before we proceed, please remember this __important__ advice from the [Pro Git book](https://git-scm.com/book/en/v2/Git-Branching-Rebasing):

> Do not rebase commits that exist _outside_ your repository.
>
> If you follow that guideline, you’ll be fine. __If you don’t, people will hate you, and you’ll be scorned by friends and family__.

This simple rule also applies to _any_ operation which **changes commit hashes**, e.g. `commit --amend`, `cherry-pick`, etc.

So now that we know what to do in order to keep our friends and family at peace, let's get started with my personal workflow for working _locally_.

#### The actual workflow

The basic (and simple) idea is to use a local, dedicated, temporary feature branch where you **commit as often as you like** until the feature is done. Then the result is merged into the main line as __one commit__ without rebasing or any other major Git magic.

The important steps are printed in bold.  
I'll assume two things:

  1. The main line is called `master`
  2. The local branch is called `my_feature`

The workflow itself is fairly easy once you have used it yourself:

- Create a __local__ branch from the main line (called `my_feature` in this example)  
   *The branch's name is for __your eyes__ only, as it will remain local*
- Work on `my_feature`
- __Commit as often as you like__  
   _The code does not even have to compile_  
   _The commit messages are not important. They are, again, for **your eyes** only_.
- Finish feature (with a couple of commits) in `my_feature`
- Merge newest additions from `master` into `my_feature`
   _Don't forget to `pull` beforehand_  
   _Of course, you can do this in between as well_
- Resolve any conflicts
- Checkout `master`
- __Squash your commits into one onto `master` with `git merge --squash my_feature`__  
   _You'll now have all the changes (*not* the commits!) from `my_feature` in the `master's` staging area (`merge --squash` doesn't auto-commit)_
- Verify everything works as expected on `master`
- Commit and write a __decent__ commit message (which will get pushed)
- Push
- Delete `my_feature`  
   _This is important! Otherwise you might be tempted to continue using it even after merging the result into master._

#### Benefits

I use this workflow because of the following reasons:

- Work in progress is kept separately in a single, _dedicated_, _local_ branch
- Switching tasks is easy, just commit the latest work and checkout a different branch to work on (`git stash` could be used but the stash can be deleted accidentally, e.g. `git stash drop`).
- All of your work in progress is safely stored in Git
- You cannot accidentally push a local-only branch which has no `remote`
- Since the branch will not get pushed you can also change commits _if_ you like (rewrite, reorder, delete, etc.)

#### Drawbacks

- Git will not know that `my_feature` has been integrated into `master`  
   *This is why you should delete `my_feature` after you `merge --squash` and `commit` to `master`. At this point __you__ know that everything has been merged.*

#### Example

I am writing this blog as a single file which is version controlled in a local branch of a Git repository which also holds my presentation files. I have created a new branch for the work in progress and commit the text from time to time. However, in the end I want to have one commit for the blog entry, since I do not care how I got to the end result, I just want to save in between.

So here are my commits in my local branch `blog`:

```
$ git log --oneline --decorate
53a53dd (HEAD, blog) Some last modifications
3c494d9 Add conclusion, remove more TODOs
f20e47b Remove TODOs
bebcc78 Benefits and Drawbacks
843b6e9 Finished workflow section
e3aa37c Some minor corrections
b47eec4 Add example
92009c7 Until benefits
7ee81bc First draft of blog
```

After the `git merge --squash blog` on branch `master`, as you can see, there is only one new file in the staging area:

```
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    new file:   blog/blog.mdown
```

After committing the finished blog my history looks this way:

```
$ git log --oneline --decorate --graph --all
* 2281abe (HEAD, master) Git blog entry about 'merge --squash'
| * 2cca283 (blog) Updated example
| * 53a53dd Some last modifications
| * 3c494d9 Add conclusion, remove more TODOs
| * f20e47b Remove TODOs
| * bebcc78 Benefits and Drawbacks
| * 843b6e9 Finished workflow section
| * e3aa37c Some minor corrections
| * b47eec4 Add example
| * 92009c7 Until benefits
| * 7ee81bc First draft of blog
|/  
* 25690aa (origin/master) Add PDF for latest version
```

The `blog` commits (`7ee81bc` through to `2cca283`) have been squashed into commit `2281abe` on `master`.

#### Conclusion

If used responsibly, Git's capabilities in rewriting history _can_ be very helpful. The local `merge --squash` workflow can safely store work-in-progress and hence protect your work from accidental modification or loss (this does not apply to `git stash` for example, since you can always `drop` the `stash`). 
As always, you don't _have_ to use this feature, Git just makes it possible for those who want to. So go ahead and try! It certainly changed the way I work locally.