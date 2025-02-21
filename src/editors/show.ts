import { ComplexTab } from "@halcyontech/vscode-ibmi-types/api/CustomUI";
import { l10n } from "vscode";
import { Code4i } from "../code4i";
import { AFSServer } from "../types";

export async function openShowServerEditor(server: AFSServer) {
  const instanceSection = Code4i.customUI()
    .addParagraph(`<table>
       ${addRow(l10n.t("IFS path"), server.ifsPath)}
       ${addRow(l10n.t("Job queue"), `${server.jobqLibrary}/${server.jobqName}`)}
       ${addRow(l10n.t("Job user"), `${server.user}`)}
       ${addRow(l10n.t("Java home"), `${server.javaHome}`)}
       ${addRow(l10n.t("Java properties"), `${server.javaProps}`)}
       ${addRow(l10n.t("Running"), `${server.running ? l10n.t("Yes") : l10n.t("No")}`)}
    </table>`);
  const tabs : ComplexTab[] = [{ label: l10n.t("{0} instance", server.name), fields: instanceSection.fields }];
  if (server.running) {
    const [job] = await Code4i.runSQL(`Select * From Table(QSYS2.JOB_INFO(` +
      `JOB_USER_FILTER => '${server.user}', ` +
      `JOB_STATUS_FILTER => '*ACTIVE', ` +
      `JOB_TYPE_FILTER => '*BATCH')) ` +
      `Where JOB_NAME = '${server.jobNumber}/${server.jobUser}/${server.jobName}'`
    );
    const jobSection = Code4i.customUI()
      .addParagraph(`<table>
        ${addRow(l10n.t("Name"), job.JOB_NAME)}
        ${addRow(l10n.t("Type"), job.JOB_TYPE_ENHANCED)}
        ${addRow(l10n.t("Status"), job.JOB_STATUS)}        
        ${addRow(l10n.t("Subsystem"), job.JOB_SUBSYSTEM)}
        ${addRow(l10n.t("Job description"), `${job.JOB_DESCRIPTION_LIBRARY}/${job.JOB_DESCRIPTION}`)}
        ${addRow(l10n.t("Job queue"), `${job.JOB_QUEUE_LIBRARY}/${job.JOB_QUEUE_NAME}`)}
        ${addRow(l10n.t("Entered system on"), job.JOB_ENTERED_SYSTEM_TIME)}
        ${addRow(l10n.t("Active on"), job.JOB_ACTIVE_TIME)}
        ${addRow(l10n.t("Pick temporary storage"), job.PEAK_TEMPORARY_STORAGE)}
        ${addRow(l10n.t("CCSID"), job.CCSID)}
        ${addRow(l10n.t("Language ID"), job.LANGUAGE_ID)}
        ${addRow(l10n.t("Country ID"), job.COUNTRY_ID)}
        ${addRow(l10n.t("Date format"), job.DATE_FORMAT)}
        ${addRow(l10n.t("Date separator"), job.DATE_SEPARATOR)}
        ${addRow(l10n.t("Time separator"), job.TIME_SEPARATOR)}
        ${addRow(l10n.t("Logging level"), job.MESSAGE_LOGGING_LEVEL)}
        ${addRow(l10n.t("Logging severity"), job.MESSAGE_LOGGING_SEVERITY)}
        ${addRow(l10n.t("Logging text"), job.MESSAGE_LOGGING_TEXT)}
      </table>`);
    tabs.push({ label: l10n.t("Current job"), fields: jobSection.fields });
  }

  Code4i.customUI().addComplexTabs(tabs).loadPage(l10n.t("Show {0}", server.name));
}

function addRow(key: string, value: any) {
  return /*html*/ `<tr>
    <td><vscode-label>${key}:</vscode-label></td>
    <td>${value}</td>
  </tr>`;
}
