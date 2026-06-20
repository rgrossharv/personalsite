# Personal Site

This repository contains the static files for `rylandgross.com`.

## GIMPS Status Data

The Projects page includes a small Distributed Computing / GIMPS status section
for a couple of homelab machines running `mprime`. The page reads machine status
from:

- `data/lenovo-gimps.json`
- `data/hpomen-gimps.json`

These JSON files are updated only occasionally. The machines are older personal
computers with relatively low clock speeds, and only a small number of workers
and CPU cores are assigned to the searches, so visible progress can be slow.

The status files are meant to be updated by local tooling and shell programming,
not by hand-editing the page. The website simply fetches the JSON files and
renders the most recent snapshot that has been committed.
