@echo off
echo Organizing Project Files...

echo Creating directories...
mkdir "database\scripts" 2>nul
mkdir "docs\proposals" 2>nul
mkdir "docseports" 2>nul
mkdir "docsesources" 2>nul

echo Moving SQL scripts...
move "sql_*.txt" "database\scripts"

echo Moving Documentation...
move "B2B_MATCHMAKING_ENGINE_DOCUMENTATION.md" "docs\proposals"
move "GEMINI_AI_MATCHMAKING_PROPOSAL.md" "docs\proposals"
move "tmp_rovodev_b2b_engine_part1.md" "docs\proposals"
move "tmp_rovodev_b2b_engine_part2.md" "docs\proposals"

echo Moving Reports...
move "EVENTRA_SECURITY_AUDIT_REPORT.md" "docseports"
move "SITE_PROBLEMS.md" "docseports"

echo Moving Resources...
move "GITS 2025 Program Event  ABIDJAN V3 - 020625.pptx.pdf" "docsesources"
move "Program Event GITS final.pptx.pdf" "docsesources"
move "mock_event_data.md" "docsesources"

echo Moving assets...
move "faviconeventra.png" "public"

echo Organization complete! Your project is now clean.
pause