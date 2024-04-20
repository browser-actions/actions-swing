import { createPackageManager } from "./distributions";
import type { InstallOption, UninstallOption } from "./types";

const install = async (
  packageNames: string[] | string,
  opts?: InstallOption,
) => {
  const pkgmgr = await createPackageManager();
  await pkgmgr.install(
    Array.isArray(packageNames) ? packageNames : [packageNames],
    opts,
  );
};

const uninstall = async (
  packageNames: string[] | string,
  opts?: UninstallOption,
) => {
  const pkgmgr = await createPackageManager();
  await pkgmgr.uninstall(
    Array.isArray(packageNames) ? packageNames : [packageNames],
    opts,
  );
};

export { install, uninstall };
