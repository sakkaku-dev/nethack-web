import { STATUS_FIELD } from "../generated";
import { Status } from "../models";
import { statusMap } from "../nethack-models";

export function parseAndMapStatus(str: string, status: Status) {
	// 3.6 updates the status with putStr:
	// Web_user the Aspirant        St:18/20 Dx:12 Co:15 In:9 Wi:18 Ch:12  Lawful
	// Dlvl:1  $:0  HP:14(14) Pw:8(8) AC:7  Exp:1 T:200

	const statLineRegex = /St:\d+.*Dx:\d+.*/;

	// Split regex more in case some things can be hidden/shown
	if (statLineRegex.test(str)) {
		let m = str.match(/\w ([a-zA-z\s]+) .* St:.*Ch:\d+ [\s]* (\w+)/);
		if (m) {
			statusMap[STATUS_FIELD.BL_TITLE](status, m[1]);
			statusMap[STATUS_FIELD.BL_ALIGN](status, m[2]);
		}

		m = str.match(/St:([\d\/]+) Dx:(\d+) Co:(\d+) In:(\d+) Wi:(\d+) Ch:(\d+)/);
		if (m) {
			statusMap[STATUS_FIELD.BL_STR](status, m[1]);
			statusMap[STATUS_FIELD.BL_DX](status, m[2]);
			statusMap[STATUS_FIELD.BL_CO](status, m[3]);
			statusMap[STATUS_FIELD.BL_IN](status, m[4]);
			statusMap[STATUS_FIELD.BL_WI](status, m[5]);
			statusMap[STATUS_FIELD.BL_CH](status, m[6]);
		}
	} else {
		let m = str.match(/HP:(\d+)\((\d+)\).*Pw:(\d+)\((\d+)\)/);
		if (m) {
			statusMap[STATUS_FIELD.BL_HP](status, m[1]);
			statusMap[STATUS_FIELD.BL_HPMAX](status, m[2]);
			statusMap[STATUS_FIELD.BL_ENE](status, m[3]);
			statusMap[STATUS_FIELD.BL_ENEMAX](status, m[4]);
		}

		m = str.match(/Dlvl:(\d+)/);
		if (m) statusMap[STATUS_FIELD.BL_LEVELDESC](status, m[1]);

		m = str.match(/\$:(\d+)/);
		if (m) statusMap[STATUS_FIELD.BL_GOLD](status, m[1]);

		m = str.match(/AC:([-]?\d+)/);
		if (m) statusMap[STATUS_FIELD.BL_AC](status, m[1]);

		m = str.match(/Xp:(\d+\/\d+)/); // Contains lvl + exp
		if (m) {
			const v = m[1].split("/");
			statusMap[STATUS_FIELD.BL_EXP](status, v[0]);
			statusMap[STATUS_FIELD.BL_XP](status, v[1]);
		} else {
			m = str.match(/Exp:(\d+)/);
			if (m) statusMap[STATUS_FIELD.BL_EXP](status, m[1]);
		}

		m = str.match(/T:(\d+)/);
		if (m) statusMap[STATUS_FIELD.BL_TIME](status, m[1]);

		m = str.match(/([a-zA-Z\s]+)$/); // Contains everything status related, eg hunger, conditions
		if (m) statusMap[STATUS_FIELD.BL_HUNGER](status, m[1]);
	}
}