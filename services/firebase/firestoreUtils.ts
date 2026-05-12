import {
    auth,
} from './index';


export enum OperationType {

    CREATE = 'create',

    UPDATE = 'update',

    DELETE = 'delete',

    LIST = 'list',

    GET = 'get',

    WRITE = 'write',
}


interface FirestoreErrorInfo {

    error: string;

    operationType:
        OperationType;

    path:
        string | null;

    timestamp:
        string;

    authInfo: {

        userId?:
            string | null;

        email?:
            string | null;

        emailVerified?:
            boolean | null;

        isAnonymous?:
            boolean | null;

        tenantId?:
            string | null;

        providerInfo?: {

            providerId?:
                string | null;

            email?:
                string | null;

        }[];
    };

    retryable:
        boolean;
}


export function
handleFirestoreError(

    error: unknown,

    operationType:
        OperationType,

    path:
        string | null
) {

    const isRetryable =

        error instanceof Error && (

            error.message.includes(
                'unavailable'
            ) ||

            error.message.includes(
                'offline'
            ) ||

            error.message.includes(
                'internal'
            )
        );

    const errInfo:
        FirestoreErrorInfo = {

        error:

            error instanceof Error

                ? error.message

                : String(error),

        timestamp:
            new Date()
                .toISOString(),

        retryable:
            isRetryable,

        authInfo: {

            userId:
                auth.currentUser?.uid,

            email:
                auth.currentUser?.email,

            emailVerified:
                auth.currentUser?.emailVerified,

            isAnonymous:
                auth.currentUser?.isAnonymous,

            tenantId:
                auth.currentUser?.tenantId,

            providerInfo:

                auth.currentUser
                    ?.providerData
                    ?.map((provider) => ({

                        providerId:
                            provider.providerId,

                        email:
                            provider.email,
                    })) || [],
        },

        operationType,

        path,
    };

    console.error(
        `[${errInfo.timestamp}] Firestore Error (${operationType} ${path}):`,
        errInfo
    );

    // retryable error
    // do not crash app

    if (isRetryable) {

        console.warn(
            `[${errInfo.timestamp}] Error is retryable`
        );

        return;
    }

    throw new Error(
        JSON.stringify(errInfo)
    );
}