
#include <QtGui>

#include "window.h"

int main(int argc, char *argv[])
{
	QApplication app(argc, argv);
	app.setWindowIcon (QIcon(QPixmap("icon.bmp"))); 
	QTextCodec *cyrillicCodec = QTextCodec::codecForName("CP1251");
	QTextCodec::setCodecForTr(cyrillicCodec);
	QTextCodec::setCodecForLocale(cyrillicCodec);
	QTextCodec::setCodecForCStrings(cyrillicCodec);
  
	Window window;
	
    window.setWindowTitle("ярн й ндмнлс v1.2");
	
    window.resize(850, 750);
    window.show();
    return app.exec(); 
}
