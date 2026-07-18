// js/dateUtils.js


/*
    Convert ISO date into readable format

    Example:
    2025-03-15T10:30:00Z

    becomes:

    15 Mar 2025
*/

export function formatDate(dateString) {

    const date = new Date(dateString);


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}



/*
    Convert date into relative time

    Example:

    3 days ago
    yesterday
    today
*/

export function formatRelativeTime(dateString) {


    const date = new Date(dateString);

    const now = new Date();


    const difference =
        date - now;


    const days =
        Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );


    return new Intl.RelativeTimeFormat(
        "en",
        {
            numeric: "auto"
        }
    ).format(
        days,
        "day"
    );

}



/*
    Final display format

    Example:

    15 Mar 2025 (3 days ago)

*/

export function formatFullDate(dateString) {

    return `${formatDate(dateString)} (${formatRelativeTime(dateString)})`;

}