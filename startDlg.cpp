
#include <QtGui>

#include <QDialog>
#include "startDlg.h"

StartDlg::StartDlg(QWidget *parent)
: QDialog(parent)
{
  startButton = new QPushButton(tr("�����"));
  settingsButton = new QPushButton(tr("���������"));
  helpButton = new QPushButton(tr("��������"));
  exitButton = new QPushButton(tr("�����"));

  QVBoxLayout *vLayout = new QVBoxLayout;
  vLayout->addWidget(startButton);
  vLayout->addWidget(settingsButton);
  vLayout->addWidget(exitButton);
  setLayout(vLayout);

  connect(startButton, SIGNAL(clicked()), this, SLOT(accept()));
  connect(settingsButton, SIGNAL(clicked()), this, SLOT(setSettings()));
  connect(helpButton, SIGNAL(clicked()), this, SLOT(manual()));
  connect(exitButton, SIGNAL(clicked()), this, SLOT(reject()));
  
  resize(220,130);
}

StartDlg::~StartDlg()
{
}

void StartDlg::setSettings()
{
  settDlg.exec();
} 

void StartDlg::manual()
{

}
