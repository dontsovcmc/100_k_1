
#ifndef SETTDLG_H
#define SETTDLG_H

#include <QWidget>
#include <QDialog>
#include "window.h"

#include "ui_GeneralGameSett.h"
#include "ui_MainSett.h"
#include "ui_QuestionSett.h"

class QTabWidget;
class QDialogButtonBox;
class QSpinBox;

class GeneralGameTab : public QWidget
{
  Q_OBJECT

public:
  GeneralGameTab(GameSettings *psett);
  
  Ui::Form generalGameUI;
private:
};

class MainSettingsTab : public QWidget
{ Q_OBJECT
public:
  MainSettingsTab(GameSettings *psett);

  Ui::FormMain MainUI;
private:
  QFont *m_pQuestionFont, 
    *m_pAnswerFont, 
    *m_pServiceFont,
    *m_pTeamTitleFont;
  void GetFontDlg(QFont *pDstFont);

public slots:
  void FontQuestionClick();
  void FontAnswerClick();
  void FontServiceClick();
  void FontTeamClick();
};

class QuestionTab : public QWidget
{ Q_OBJECT
public:

  Ui::FormQuestion QuestionUI;
  QuestionTab(Question *pQuestion);

  QLineEdit *Answers[MAX_ANSWER];
  QSpinBox  *Points[MAX_ANSWER];
private:
};


/* =========================== */
class SettingsDialog : public QDialog
{
  Q_OBJECT

public:
  SettingsDialog(QWidget *parent = 0);
  ~SettingsDialog();
private:
  QTabWidget *tabWidget;
  QDialogButtonBox *buttonBox;
  GeneralGameTab *m_pGeneralGameTab;
  MainSettingsTab *m_pMainSettingsTab;
  QuestionTab *m_pQuestionTab[MAX_ROUND];
  GameSettings m_gameSettings;

public slots:
  void accept();
};


#endif