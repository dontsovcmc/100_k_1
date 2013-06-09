
#include <QtGui>

#include <QDialog>
#include "settDlg.h"
#include "window.h"

SettingsDialog::SettingsDialog(QWidget *parent)
: QDialog(parent)
{
  m_gameSettings.LoadSettings(SETT_FILE_PATH);

  tabWidget = new QTabWidget;
  m_pGeneralGameTab = new GeneralGameTab(&m_gameSettings);
  m_pMainSettingsTab = new MainSettingsTab(&m_gameSettings);
  for (int i=0;i < MAX_QUESTION; i++)
    m_pQuestionTab[i] = new QuestionTab(&m_gameSettings);

  tabWidget->addTab(m_pGeneralGameTab, tr("General"));
  tabWidget->addTab(m_pMainSettingsTab, tr("Permissions"));
  for (int i=0;i < MAX_QUESTION; i++)
    tabWidget->addTab(m_pQuestionTab[i], tr("Вопрос ") + QString::number(i));

  buttonBox = new QDialogButtonBox(QDialogButtonBox::Ok
    | QDialogButtonBox::Cancel);

  connect(buttonBox, SIGNAL(accepted()), this, SLOT(accept()));
  connect(buttonBox, SIGNAL(rejected()), this, SLOT(reject()));

  QVBoxLayout *mainLayout = new QVBoxLayout;
  mainLayout->addWidget(tabWidget);
  mainLayout->addWidget(buttonBox);
  setLayout(mainLayout);

  setWindowTitle(tr("Настройки"));
  resize(600,350);
}

SettingsDialog::~SettingsDialog()
{
}

void SettingsDialog::accept()
{
  //m_pGeneralGameTab
  m_gameSettings.command0name = m_pGeneralGameTab->generalGameUI.command0Name->text();
  m_gameSettings.command1name = m_pGeneralGameTab->generalGameUI.command1Name->text();
  m_gameSettings.Rounds[ROUND_1] = m_pGeneralGameTab->generalGameUI.chkRound_1->isChecked();
  m_gameSettings.Rounds[ROUND_2] = m_pGeneralGameTab->generalGameUI.chkRound_2->isChecked();
  m_gameSettings.Rounds[ROUND_3] = m_pGeneralGameTab->generalGameUI.chkRound_3->isChecked();
  m_gameSettings.Rounds[ROUND_OBR] = m_pGeneralGameTab->generalGameUI.chkRound_Obr->isChecked();
  m_gameSettings.Rounds[ROUND_SUPER] = m_pGeneralGameTab->generalGameUI.chkRound_Super->isChecked();
  

  //--------------
  m_gameSettings.SaveSettings(SETT_FILE_PATH);
  QDialog::accept();
}

GeneralGameTab::GeneralGameTab(GameSettings *psett, QWidget *parent)
{
  generalGameUI.setupUi(this);

  generalGameUI.command0Name->setText(psett->command0name);
  generalGameUI.command1Name->setText(psett->command1name);
  generalGameUI.chkRound_1->setChecked(psett->Rounds[ROUND_1]);
  generalGameUI.chkRound_2->setChecked(psett->Rounds[ROUND_2]);
  generalGameUI.chkRound_3->setChecked(psett->Rounds[ROUND_3]);
  generalGameUI.chkRound_Obr->setChecked(psett->Rounds[ROUND_OBR]);
  generalGameUI.chkRound_Super->setChecked(psett->Rounds[ROUND_SUPER]);
}

MainSettingsTab::MainSettingsTab(GameSettings *psett, QWidget *parent)
{

}

QuestionTab::QuestionTab(GameSettings *psett, QWidget *parent)
{

}