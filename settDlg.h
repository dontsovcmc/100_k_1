
#ifndef SETTDLG_H
#define SETTDLG_H

#include <QWidget>
#include <QDialog>
#include "window.h"

#include "ui_GeneralGameSett.h"

class QTabWidget;
class QDialogButtonBox;

class GeneralGameTab : public QWidget
{
  Q_OBJECT

public:
  GeneralGameTab(GameSettings *psett, QWidget *parent = 0);

  Ui::Form generalGameUI;
private:
  GameSettings localSettings;
};

class MainSettingsTab : public QWidget
{ Q_OBJECT
public:
  MainSettingsTab(GameSettings *psett, QWidget *parent = 0);
private:
  GameSettings localSettings;
};

class QuestionTab : public QWidget
{ Q_OBJECT
public:
  QuestionTab(GameSettings *psett, QWidget *parent = 0);
private:
  GameSettings localSettings;
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

  void accept();
public slots:
};


#endif