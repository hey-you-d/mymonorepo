import { ERROR_REPORTING_TARGET } from "@/lib/app/featureFlags";

export const customResponseMessage = async (fnSignature: string, fnName: string, customMsg: string) => {
    // in real world scenario, this sort of error msg must not be visible to public.
    // A detailed error msg should only be sent to a remote logging service, whereas client will be presented
    // with a simplified error msg such as: "An error has been encountered (HTML status code: 500)". 
    const msg = `${fnSignature} | ${fnName} | ${customMsg}`;
    if (ERROR_REPORTING_TARGET === "remoteLogging") { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.log(msg);
    }
    return msg;
}
export const catchedErrorMessage = async (fnSignature: string, fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    if (ERROR_REPORTING_TARGET === "remoteLogging") { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.error(errorMsg);
    }
    return errorMsg;
}
export const missingParamErrorMessage = async (fnSignature: string, fnName: string, missingParamMsg: string) => {
    const errorMsg = `${fnSignature} | ${fnName} | ${missingParamMsg}`;
    if (ERROR_REPORTING_TARGET === "remoteLogging") { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.error(errorMsg);
    }
    return errorMsg;
}
export const notOkErrorMessage = async (fnSignature: string, fnName: string, response: Response) => {
    const errorMsg = `${fnSignature} | ${fnName} | not ok response: ${response.status} - ${response.statusText} `;
    if (ERROR_REPORTING_TARGET === "remoteLogging") { 
        /* upload to remote log reporting tool such as sumologic, datadog, splunk, etc */ 
    } else {
        console.error(errorMsg);
    }
    return errorMsg;
}
