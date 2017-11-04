#prerequisite: create "data" folder in the mysql folder

#run first time only
D:\mysql-5.7.20-winx64\bin> .\mysqld.exe --initialize-insecure

#change root password
D:\mysql-5.7.20-winx64\bin> .\mysqladmin -u root password w0rldp4y!

#start mysql server
D:\mysql-5.7.20-winx64\bin> .\mysqld.exe --console