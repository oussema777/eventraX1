# Community Sector Cleanup

This folder contains scripts for exporting and normalizing:

- `profiles.industry`
- `profiles.b2b_profile.industries_of_interest`

## Scripts

- `export-community-sectors.mjs`
  Reads profile rows from Supabase and writes raw export files to `output/`.

- `normalize-community-sectors.mjs`
  Reads the raw export, marks obvious junk as `Other`, collapses simple duplicates,
  and limits the result to the top 40 canonical industries plus `Other`.

## Output Files

- `output/community-sector-raw-export.json`
- `output/industry-raw-values.json`
- `output/b2b-industries-of-interest-raw-values.json`
- `output/community-sector-normalization-report.json`
- `output/industry-normalization-map.json`
- `output/b2b-industries-of-interest-normalization-map.json`

## Run

```bash
node scripts/community-sector-cleanup/export-community-sectors.mjs
node scripts/community-sector-cleanup/normalize-community-sectors.mjs
```

## Notes

- The normalization step is intentionally conservative.
- Anything noisy, role-like, placeholder-like, or outside the final top 40 becomes `Other`.
- Review the generated mapping files before applying database updates.
