---
author: Sven Nierlein
date: '2012-06-19T12:20:48+00:00'
slug: show-git-branch-in-bash-prompt
tags:
- git
title: Show Git Branch in Bash Prompt
---

When working a lot with git knowing which branch you are in is an important information. Putting the branch information in your bash prompt makes this information always visible and also shows immediatly if you are in a folder managed by git.

This is how it looks:
<pre style="background-color: black;">
<font color="white">13:46:50 sven@tsui:~/projects/Thruk (</font><font color="red">master</font><font color="white">) %></font>
</pre>

All you need is a simple function in your .bashrc

<!--more-->
<pre><code>
bash_prompt() {
  local   BLUE="\\[\e[0;34m\\]"
  local    RED="\\[\e[0;31m\\]"
  local  GREEN="\\[\e[0;32m\\]"
  local NORMAL="\\[\e[0;0m\\]"
  br=$(git branch --no-color 2> /dev/null | sed -e '/^[^&#42;]/d' -e 's/&#42; \\(.&#42;\\)/\1/')
  psbr=""
  if [ ! -z "$br" ]; then
    if [ "$br" = 'master' ]; then
        psbr="($RED$br$NORMAL) "
    elif [ "$br" = 'integration' ]; then
        psbr="($GREEN$br$NORMAL) "
    else
        psbr="($BLUE$br$NORMAL) "
    fi
  fi
  local UC=$NORMAL              # user's color
  local UP="%"                  # user prompt
  [ $UID -eq "0" ] && UP="#"    # root's prompt
  # set a fancy prompt
  PS1="${UC}\t \u@\h:\w$NORMAL ${psbr}$UC\\# ${UP}>$NORMAL "
  [ $UID -eq "0" ] && PS1="$PS1$GREEN"
  PS2='\t \u@\h \$&gt; '
}
PROMPT_COMMAND=bash_prompt
bash_prompt
</pre></code>

bash prompt is a bash function which will be run before displaying the prompt. By changing the PS1 variable within this function the prompt can be enhanced. The last line just calls the function once to set the nice prompt.

The master branch will be colored in red, the integration branch is green and all others are blue.