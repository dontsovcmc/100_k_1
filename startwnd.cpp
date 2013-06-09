
#include <QtGui>

#include <QDialog>
#include "startwnd.h"

StartDlg::StartDlg(QWidget *parent)
: QDialog(parent)
{
  startButton = new QPushButton(tr("СТАРТ"));
  settingsButton = new QPushButton(tr("Настройки"));
  exitButton = new QPushButton(tr("Выход"));

  QVBoxLayout *vLayout = new QVBoxLayout;
  vLayout->addWidget(startButton);
  vLayout->addWidget(settingsButton);
  vLayout->addWidget(exitButton);
  setLayout(vLayout);

  connect(startButton, SIGNAL(clicked()), this, SLOT(accept()));
  connect(settingsButton, SIGNAL(clicked()), this, SLOT(setSettings()));
  connect(exitButton, SIGNAL(clicked()), this, SLOT(reject()));
}

StartDlg::~StartDlg()
{
}

void StartDlg::setSettings()
{
  settDlg.exec();
} 
