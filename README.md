# xd-user-journey
XD plugin to create initial layout of user journey from CSV file
This plugin loads in user journey text from a CSV file and renders the different journey stages

## Data
The CSV should be arranged in the following way (see sample CSV for details):
the fist column is the row title, with entries in the following cells for that row
line1: Persona
line2: Roles
line3: Goals
line4: Needs
line5: Expectations

This data is used to populate the side-bar of the diagram

rows 6-11 are for the actual steps along the journey:
Tasks, Persona, Emotion, Touch points, Pain points
