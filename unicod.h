#ifndef UNICODE_INCLUDE_H
#define UNICODE_INCLUDE_H

#if QT_VERSION >= 0x30000
 #include <qtextcodec.h>
 #define fromUnicode(str)     (QTextCodec::codecForName("KOI8-R"))->fromUnicode(str)
 #define toUnicode(str)       (QTextCodec::codecForName("KOI8-R"))->toUnicode(str)
 #define tr2(str)         QString::fromLocal8Bit(str)
#else
 #define fromUnicode(str)     str
 #define toUnicode(str)       str
 #define tr2(str)         str
#endif

#endif

//Виновс - 1251 //Дос - 866