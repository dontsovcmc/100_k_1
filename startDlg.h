
#ifndef STARTWND_H
#define STARTWND_H

#include <QWidget>
#include <QDialog>
#include "settdlg.h"

class StartDlg : public QDialog
{
  Q_OBJECT

public:
  StartDlg(QWidget *parent = 0);
  ~StartDlg();
private:
  QPushButton *startButton;
  QPushButton *settingsButton;
  QPushButton *exitButton;
  QPushButton *helpButton;

  SettingsDialog settDlg;
public slots:
  void setSettings();
  void manual();
};

#endif