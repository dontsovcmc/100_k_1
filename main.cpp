
#include <QtGui>

#include "window.h"
#include "startDlg.h"

int main(int argc, char *argv[])
{
  QApplication app(argc, argv);
  app.setWindowIcon (QIcon(QPixmap("icon.bmp"))); 
  QTextCodec *cyrillicCodec = QTextCodec::codecForName("CP1251");
  QTextCodec::setCodecForTr(cyrillicCodec);
  QTextCodec::setCodecForLocale(cyrillicCodec);
  QTextCodec::setCodecForCStrings(cyrillicCodec);

  Window window;
  StartDlg dialog;
  if (QDialog::Accepted == dialog.exec())
  {
    window.StartGame();
    window.setWindowTitle("��� � ������ v2.0");

    window.resize(850, 750);
    window.show();

    return app.exec(); 
  }
 
  return 0;
}
