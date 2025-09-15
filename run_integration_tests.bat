@echo off
echo Running Integration Tests for RailAI System
echo =======================================

cd src\tests
node --require ts-node/register integration.test.ts

echo =======================================
echo Integration Tests Complete
pause