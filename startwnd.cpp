
#include <QtGui>

#include <QDialog>
#include "startwnd.h"

StartDlg::StartDlg(QWidget *parent)
: QDialog(parent)
{
  startButton = new QPushButton(tr("�����"));
  settingsButton = new QPushButton(tr("���������"));
  exitButton = new QPushButton(tr("�����"));

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
