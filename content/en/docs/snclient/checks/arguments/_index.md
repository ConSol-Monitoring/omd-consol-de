﻿---
title: Common check arguments
---

# Common check arguments

| Option | Description |
| --- | --- |
[filter](#filter) | Filter for which items to check.
[warning](#warning) | Threshold when to generate a warning state.
[warn](#warning) | Short alias for warning.
[critical](#critical) | Threshold when to generate a critical state.
[crit](#critical) | Short alias for critical.
[ok](#ok) | Threshold when to generate an ok state.
[empty-state](#empty-state) | Status to return when no items matches the filter.
[top-syntax](#top-syntax) | Top level syntax.
[ok-syntax](#ok-syntax) | Ok syntax.
[empty-syntax](#empty-syntax) | Empty syntax.
[detail-syntax](#detail-syntax) | Detailed/Individual Syntax.
[perf-syntax](#perf-syntax) | Perfdata syntax.

## FILTER:

Filter for items which will be included in the check. Unwanted items will be ignored and wont trigger a warning or critical state.

Filter are explained in detail here: [Check Filter](../filter/)

## WARNING:

Filter which sets a threshold when to generate a warning state. If any wanted item matches this filter the return state will be escalated to warning.

The syntax works the same way as [filter](#filter) except matching items are not removed but escalate the status to warning state.

## CRITICAL:

Filter which sets a threshold when to generate a critical state. If any wanted item matches this filter the return state will be escalated to critical.

The syntax works the same way as [filter](#filter) except matching items are not removed but escalate the status to critical state.

## OK:

Filter which sets a threshold when to generate an ok state. If any wanted item matches this filter its state will be reset to ok regardless of its previous state.

The syntax works the same way as [filter](#filter) except matching items are not removed but the status is reset to ok state.

## EMPTY-STATE:

Status to be returned when no item matches the filter. If no filter is given this wont happen.

## TOP-SYNTAX:

Sets the format for the return message. Can include text as well as special keywords that will be replaced by information from the check. Keyword Syntax: ´\${keyword} or %(keyword). $ and % as well as {} and () can be used interchangeably.

## OK-SYNTAX:

Sets the format for the return message if the state is OK. Can include text as well as special keywords that will be replaced by information from the check. Keyword Syntax: \${keyword} or %(keyword). $ and % as well as {} and () can be used interchangeably.

## EMPTY-SYNTAX:

Sets the format for the return message if no item matched the filter.

## DETAIL-SYNTAX:

Sets the format for each individual item in the message.

## PERF-SYNTAX:

Sets the format for the base names of the performance data.

# Common filter attributes

| Attribute | Description |
| --- | --- |
| status | The returned status (OK/WARN/CRIT/UNKNOWN) |
| count | Number of items matching the filter. |
| total | Total number of items |
| list | List of all items matching the filter. |
| ok_count | Number of items that are ok |
| ok_list | List of items that are ok |
| warn_count | Number of items that matched the warning threshold |
| warn_list | List of items that matched the warning threshold |
| crit_count | Number of items that matched the critical threshold |
| crit_list | List of items that matched the critical threshold |
| problem_count | Number of items that matched either warning or critical threshold |
| problem_list | List of items that matched either warning or critical threshold |