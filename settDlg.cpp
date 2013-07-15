
#include <QtGui>

#include <QDialog>
#include "settDlg.h"
#include "window.h"
#include <QFontDialog>

SettingsDialog::SettingsDialog(QWidget *parent)
: QDialog(parent)
{
  m_gameSettings.LoadSettings(SETT_FILE_PATH);

  tabWidget = new QTabWidget;
  m_pGeneralGameTab = new GeneralGameTab(&m_gameSettings);
  m_pMainSettingsTab = new MainSettingsTab(&m_gameSettings);
  for (int i=0;i < MAX_ROUND; i++)
    m_pQuestionTab[i] = new QuestionTab(&m_gameSettings.vopros[i]);

  tabWidget->addTab(m_pGeneralGameTab, tr("Игра"));
  tabWidget->addTab(m_pMainSettingsTab, tr("Системные"));
  for (int i=0;i < MAX_ROUND; i++)
    tabWidget->addTab(m_pQuestionTab[i], tr("Вопрос ") + QString::number(i+1));

  buttonBox = new QDialogButtonBox(QDialogButtonBox::Ok
    | QDialogButtonBox::Cancel);

  connect(buttonBox, SIGNAL(accepted()), this, SLOT(accept()));
  connect(buttonBox, SIGNAL(rejected()), this, SLOT(reject()));

  QVBoxLayout *mainLayout = new QVBoxLayout;
  mainLayout->addWidget(tabWidget);
  mainLayout->addWidget(buttonBox);
  setLayout(mainLayout);

  setWindowTitle(tr("Настройки"));
  resize(450,320);

  tabWidget->setCurrentIndex(0);
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
  
  //MainSettingsTab
  m_gameSettings.timeRoundObr = m_pMainSettingsTab->MainUI.spinRoundObrTimer->value();
  m_gameSettings.time1 = m_pMainSettingsTab->MainUI.spinRoundSuperPlayer1Timer->value();
  m_gameSettings.time2 = m_pMainSettingsTab->MainUI.spinRoundSuperPlayer2Timer->value();
  m_gameSettings.winpoint = m_pMainSettingsTab->MainUI.spinWinPoints->value();
  
  //m_pQuestionTab[i]
  for (int i=0;i<MAX_ROUND;i++)
  { Question *pQ = &m_gameSettings.vopros[i];
    pQ->name = m_pQuestionTab[i]->QuestionUI.lineEditQuestion->text();
    
    for (int j=0;j<MAX_ANSWER;j++)
    { pQ->answer[j] = m_pQuestionTab[i]->Answers[j]->text();
      pQ->num[j] = m_pQuestionTab[i]->Points[j]->value();
    }
  }
  //--------------
  m_gameSettings.SaveSettings(SETT_FILE_PATH);
  QDialog::accept();
}

GeneralGameTab::GeneralGameTab(GameSettings *psett)
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

MainSettingsTab::MainSettingsTab(GameSettings *psett)
{
  MainUI.setupUi(this);

  MainUI.spinRoundObrTimer->setValue(psett->timeRoundObr);
  MainUI.spinRoundSuperPlayer1Timer->setValue(psett->time1);
  MainUI.spinRoundSuperPlayer2Timer->setValue(psett->time2);
  MainUI.spinWinPoints->setValue(psett->winpoint);
  m_pQuestionFont = &psett->fontQ;
  m_pAnswerFont = &psett->fontAnswer;
  m_pServiceFont = &psett->fontService;
  m_pTeamTitleFont = &psett->fontTeamTitle;

  connect(MainUI.FontQuestionBtn, SIGNAL(clicked()), this, SLOT(FontQuestionClick()));
  connect(MainUI.FontAnswerBtn, SIGNAL(clicked()), this, SLOT(FontAnswerClick()));
  connect(MainUI.FontServiceBtn, SIGNAL(clicked()), this, SLOT(FontServiceClick()));
  connect(MainUI.FontTeamBtn, SIGNAL(clicked()),this, SLOT(FontTeamClick()));
}

void MainSettingsTab::GetFontDlg(QFont *pDstFont)
{
  bool ok;
  QFont font = QFontDialog::getFont(
    &ok, *pDstFont, this);
  if (ok)
    *pDstFont = font;
}

void MainSettingsTab::FontQuestionClick()
{ GetFontDlg(m_pQuestionFont);
}

void MainSettingsTab::FontAnswerClick()
{ GetFontDlg(m_pAnswerFont);
}

void MainSettingsTab::FontServiceClick()
{ GetFontDlg(m_pServiceFont);
}

void MainSettingsTab::FontTeamClick()
{ GetFontDlg(m_pTeamTitleFont);
}

QuestionTab::QuestionTab(Question *pQuestion)
{
  QuestionUI.setupUi(this);

  QuestionUI.lineEditQuestion->setText(pQuestion->name);
  Answers[0] = QuestionUI.lineEdit_Answ1;
  Answers[1] = QuestionUI.lineEdit_Answ2;
  Answers[2] = QuestionUI.lineEdit_Answ3;
  Answers[3] = QuestionUI.lineEdit_Answ4;
  Answers[4] = QuestionUI.lineEdit_Answ5;
  Answers[5] = QuestionUI.lineEdit_Answ6;

  Points[0] = QuestionUI.spinPoints1;
  Points[1] = QuestionUI.spinPoints2;
  Points[2] = QuestionUI.spinPoints3;
  Points[3] = QuestionUI.spinPoints4;
  Points[4] = QuestionUI.spinPoints5;
  Points[5] = QuestionUI.spinPoints6;

  for (int i=0;i<MAX_ANSWER;i++)
  { Answers[i]->setText(pQuestion->answer[i]);
    Points[i]->setValue(pQuestion->num[i]);
  }
}