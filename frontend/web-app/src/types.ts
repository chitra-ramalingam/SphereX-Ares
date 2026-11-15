export interface Target {
  id: string;
  name: string;
  ra_deg: number;
  dec_deg: number;
  reference_mjd?: number;
  pm_ra_cosdec_mas_yr?: number;
  pm_dec_mas_yr?: number;
  parallax_mas?: number;
  source_note?: string;
}

export interface FitsRecord {
  filename: string;
  relative_path: string;
  obs_id: string;
  detector: string;
  band: string;
  mjd: number;
  date_obs: string;
  wavelength_um: number;
  shape: number[];
}

export interface SedPoint {
  detector: string;
  wavelength_um: number;
  flux: number;
  filename: string;
}
