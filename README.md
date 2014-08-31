FileSyncTools
=============
This project is licensed under the gnu public license v2 (gplv2)

This project provides an API with a command line interface used to recursively match
the contents of two folders. It is implemented in node and can be used as an API inside
other node projects or installed globally and used from the command line.

It is intended to be useful for creating backups and de-duplicating files.

For example backing up multiple music folders from different machines to a single shared 
Music folder on the network without duplicating files

Usage
=====
FileSyncTools command [--flags] [params]

commands: 
   1. listMissingFiles [--includeSymbolicLinks|-fl] dir2 dir2
   2. listDuplicateFiles [--includeSymbolicLinks|-fl] dir2 dir2
   3. listFilesRecursive [--includeSymbolicLinks|-fl] dir

example:
  1. FileSyncTools listMissingFiles ~/Music /media/networkshare/Music
        Lists all files anywhere in the directory tree under ~/Music that
        are not found anywhere in the directory tree under /media/networkshare/Music
