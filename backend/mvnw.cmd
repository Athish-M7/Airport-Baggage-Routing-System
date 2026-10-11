@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Vaanam Airport Baggage Routing System
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

@REM Set JAVA_HOME if not already set
IF "%JAVA_HOME%" == "" (
    IF EXIST "C:\Program Files\Java\jdk-21.0.12.1" (
        SET "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12.1"
    ) ELSE IF EXIST "C:\Program Files\Java\latest" (
        SET "JAVA_HOME=C:\Program Files\Java\latest"
    )
)

SET "MAVEN_CMD=%~dp0maven\apache-maven-3.9.9\bin\mvn.cmd"

IF EXIST "%MAVEN_CMD%" (
    CALL "%MAVEN_CMD%" %*
) ELSE (
    CALL mvn %*
)
